import logging
from typing import Any, Dict, List, Optional, Tuple

from peewee import fn

from common.commands.database import OutputDetails, OutputForm
from common.models import BoundingBox as BoundingBoxModel
from common.models import Entity
from common.models import EntityData as EntityDataModel
from common.models import Paper, Version, output_database, session_id
from common.types import (
    ArxivId,
    EntityData,
    EntityReference,
    EntityRelationships,
    EntityUploadInfo,
    S2Id,
)


def get_or_create_data_version(paper_id: str) -> int:
    """
    Get the index for the version of data produced by the current pipeline session. If a version
    index hasn't yet been created for this session, create one by incrementing the last version
    number found for this paper in the database.
    """
    try:
        version = Version.get(
            Version.session_id == session_id, Version.paper_id == paper_id
        )
        version_number = int(version.index)
    except Version.DoesNotExist:
        latest_version = (
            Version.select(fn.Max(Version.index))
            .where(Version.paper_id == paper_id)
            .scalar()
        )
        version_number = latest_version + 1 if latest_version is not None else 0
        Version.create(paper_id=paper_id, index=version_number, session_id=session_id)

    return version_number


def upload_entities(
    s2_id: S2Id,
    arxiv_id: ArxivId,
    entities: List[EntityUploadInfo],
    data_version: Optional[int] = None,
) -> None:
    """
    Before uploading entities, make sure to upload all other entities that the entity depends on.
    For example, if symbols have a data field that references sentences, make sure to upload the
    sentence entities before uploading the symbol entities. Otherwise, the references won't
    resolve to valid Postgres IDs and this function will crash.

    Set 'data_version' as 'None' (or don't specify it) if you want to tag the entities with the
    default data version. The default is to set the version index to a unique version number
    corresponding to this run of the pipeline.
    """

    try:
        paper = Paper.get(Paper.s2_id == s2_id)
    except Paper.DoesNotExist:
        paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

    # Generate the version number of data for this table if one wasn't specified. This relies on
    # a paper having already been created, because the version table references the paper table.
    if data_version is None:
        data_version = get_or_create_data_version(paper.s2_id)

    entity_models = []
    bounding_box_models = []
    entity_data_models = []
    for entity in entities:

        # Create model for entity.
        entity_model = Entity(
            version=data_version,
            paper=paper,
            type=entity.type_,
            within_paper_id=entity.id_,
        )
        entity_models.append(entity_model)

        # Create models for bounding boxes.
        for box in entity.bounding_boxes:
            box_model = BoundingBoxModel(
                entity=entity_model,
                page=box.page,
                left=box.left,
                top=box.top,
                width=box.width,
                height=box.height,
            )
            bounding_box_models.append(box_model)

        # Create models for all entity data.
        if entity.data is not None:
            entity_data_models.extend(make_data_models(entity_model, None, entity.data))

    # Save models. This will assign unique IDs to each entity.
    with output_database.atomic():
        Entity.bulk_create(entity_models, 200)
    with output_database.atomic():
        BoundingBoxModel.bulk_create(bounding_box_models, 100)
    with output_database.atomic():
        EntityDataModel.bulk_create(entity_data_models, 200)

    # Upload entity relationships (i.e., references from the entities to other entities). This
    # should happen after the entity models are created, because the relationships may include
    # references between entities (e.g., some symbols may be children of others), and we need to
    # know the row IDs of the uploaded entities to make links between them in the database.
    all_entity_models = fetch_entity_models(s2_id, data_version)
    for entity_model in entity_models:
        all_entity_models[
            (entity_model.type, entity_model.within_paper_id)
        ] = entity_model

    entity_relationship_models: List[EntityDataModel] = []
    for entity in entities:
        if entity.relationships is not None:
            entity_relationship_models.extend(
                make_relationship_models(
                    (entity.type_, entity.id_), entity.relationships, all_entity_models
                )
            )

    with output_database.atomic():
        EntityDataModel.bulk_create(entity_relationship_models, 200)


EntityType = str
WithinPaperId = str
EntityIdentifier = Tuple[EntityType, WithinPaperId]
EntityModels = Dict[EntityIdentifier, Entity]


def fetch_entity_models(s2_id: str, data_version: Optional[int] = None) -> EntityModels:
    """
    Build a map from the within-paper entity IDs to database row IDs. It is assumed that the
    number of entities already uploaded for this paper won't be so many that they can't all
    be stored in memory.
    """

    if data_version is None:
        data_version = get_or_create_data_version(s2_id)

    entity_models: EntityModels = {}
    rows = Entity.select(Entity.type, Entity.within_paper_id, Entity.id).where(
        Entity.paper_id == s2_id, Entity.version == data_version
    )
    for entity_model in rows:
        entity_models[(entity_model.type, entity_model.within_paper_id)] = entity_model

    return entity_models


def make_data_models(
    entity_model: Optional[Entity], entity_model_id: Optional[str], data: EntityData
) -> List[EntityDataModel]:
    " Either 'entity_model' or 'entity_model_id' must be defined. "

    if entity_model is None and entity_model_id is None:
        logging.warning(  # pylint: disable=logging-not-lazy
            "Attempted to create data models without providing an entity model or explicit ID. "
            + "At least one of these must be provided to determine which entity the data should "
            + "be associated with."
        )
        return []

    models: List[EntityDataModel] = []

    # Create models for each field in the entity data.
    for key, value in data.items():

        # The value may have been specified as a list, or as a single scalar value.
        # Unpack all of the values for this key into a list.
        values: List[Any] = []
        if isinstance(value, list):
            of_list = True
            values.extend(value)
        else:
            of_list = False
            values.append(value)

        if len(values) == 0:
            continue

        value_types = {type(v) for v in values}
        if not len(value_types) == 1:
            logging.warning(  # pylint: disable=logging-not-lazy
                "Attempted to upload multiple primitive types of data for key %s. "
                + "Types were %s. Not permitted. Skipping this value.",
                key,
                value_types,
            )
            continue

        # Create a new row for each value, with information of the base data type
        # and whether that row belongs to a list. If casting of values needs to occur
        # for values based on type to make them appropriate for insertion in Postgres
        # (e.g., casting booleans to 0 / 1), that should happen here.
        for v in values:
            type_ = None
            # Check for boolean needs to come before check for int, because booleans
            # will pass the check 'isinstance(v, int)'.
            if isinstance(v, bool):
                type_ = "boolean"
                v = 1 if v else 0
            if isinstance(v, int):
                type_ = "integer"
            elif isinstance(v, float):
                type_ = "float"
            elif isinstance(v, str):
                type_ = "string"
            else:
                logging.debug(  # pylint: disable=logging-not-lazy
                    "When create a row of entity data, a primitive type could not be "
                    + "determined for a value with the key '%s'. Make sure that all "
                    + "entity data is either a primitive type or a list of primitive types. "
                    + "No row will be created for this data value."
                )

            if type_ is not None:
                if entity_model is not None:
                    models.append(
                        EntityDataModel(
                            entity=entity_model,
                            key=key,
                            value=v,
                            item_type=type_,
                            of_list=of_list,
                            relation_id=None,
                        )
                    )
                elif entity_model_id is not None:
                    models.append(
                        EntityDataModel(
                            entity_id=entity_model_id,
                            key=key,
                            value=v,
                            item_type=type_,
                            of_list=of_list,
                            relation_id=None,
                        )
                    )

    return models


def make_relationship_models(
    entity_identifier: EntityIdentifier,
    relationships: EntityRelationships,
    entity_models: EntityModels,
) -> List[EntityDataModel]:
    def resolve_model(entity_identifier: EntityIdentifier) -> Optional[Entity]:
        " Helper for resolving an entity ID into a database row ID. "
        try:
            return entity_models[entity_identifier]
        except KeyError:
            type_, within_paper_id = entity_identifier
            logging.warning(  # pylint: disable=logging-not-lazy
                "Could not upload reference to entity %s of type "
                + "%s, because no database row ID could be found for the entity %s of type "
                + "%s. Check to make sure the data for entities of type %s have been uploaded.",
                within_paper_id,
                type_,
                within_paper_id,
                type_,
                type_,
            )
            return None

    models: List[EntityDataModel] = []

    # Get the model for the entity for which relationships will be saved.
    entity = resolve_model(entity_identifier)
    if entity is None:
        return []

    for k, v in relationships.items():
        if isinstance(v, EntityReference) and v.id_ is not None:
            referenced_entity = resolve_model((v.type_, v.id_))
            if referenced_entity is not None:
                models.append(
                    EntityDataModel(
                        entity=entity,
                        key=k,
                        value=referenced_entity.id,
                        item_type="relation-id",
                        of_list=False,
                        relation_type=v.type_,
                    )
                )
        elif isinstance(v, list) and len(v) > 0 and isinstance(v[0], EntityReference):
            for reference in v:
                if reference.id_ is None:
                    continue
                referenced_entity = resolve_model((reference.type_, reference.id_))
                if referenced_entity is not None:
                    models.append(
                        EntityDataModel(
                            entity=entity,
                            key=k,
                            value=referenced_entity.id,
                            item_type="relation-id",
                            of_list=True,
                            relation_type=reference.type_,
                        )
                    )

    return models


def write_to_file(entity_infos: List[EntityUploadInfo], output_file_name: str) -> None:
    # an attempt to make life easier if we change how we want to format this
    FORMAT_VERSION = "v0"

    logging.info(
        "About to write %d entity infos to %s (version: %s).",
        len(entity_infos),
        output_file_name,
        FORMAT_VERSION,
    )
    to_write = {
        "version": FORMAT_VERSION,
        "data": [dataclasses.asdict(entity_info) for entity_info in entity_infos],
    }
    already_exists_msg = (
        f"File {output_file_name} already exists. "
        + "Not overwriting. Entity infos will not be written."
    )
    assert not os.path.exists(output_file_name), already_exists_msg

    with open(output_file_name, "w") as output_file:
        json.dump(to_write, output_file)


def save_entities(
    s2_id: S2Id,
    arxiv_id: ArxivId,
    entity_infos: List[EntityUploadInfo],
    data_version: Optional[int],
    output_details: OutputDetails,
    filename: str,
) -> None:

    if output_details.save_to_file():
        logging.info("Saving to file...")
        # should always be true, but let's just make sure
        assert output_details.output_dir is not None, "Expected a defined output dir!"
        output_file_name = os.path.join(output_details.output_dir, filename)
        write_to_file(entity_infos=entity_infos, output_file_name=output_file_name)

    if output_details.save_to_db():
        logging.info("Saving to db...")
        upload_entities(
            s2_id=s2_id,
            arxiv_id=arxiv_id,
            entities=entity_infos,
            data_version=data_version,
        )
