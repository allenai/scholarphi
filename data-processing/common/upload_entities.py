import logging
from typing import Any, Dict, List, Optional, Tuple

from peewee import fn

from common.models import BoundingBox as BoundingBoxModel
from common.models import Entity
from common.models import EntityData as EntityDataModel
from common.models import Paper, Version, output_database, session_id
from common.types import ArxivId, EntityInformation, EntityReference, S2Id


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
    entities: List[EntityInformation],
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

        # Create models for each field in the entity data.
        if entity.data is not None:
            for key, value in entity.data.items():

                # The value may have been specified as a list, or as a single scalar value.
                # Unpack all of the values for this key into a list.
                values: List[Any] = []
                if isinstance(value, list):
                    of_list = True
                    values.extend(value)
                else:
                    of_list = False
                    values.append(value)

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
                # and whether that row belongs to a list.
                for v in values:
                    type_ = None
                    if isinstance(v, int):
                        type_ = "int"
                    elif isinstance(v, float):
                        type_ = "float"
                    elif isinstance(v, str):
                        type_ = "str"

                    if type_ is not None:
                        entity_data_models.append(
                            EntityDataModel(
                                entity=entity_model,
                                key=key,
                                value=v,
                                item_type=type_,
                                of_list=of_list,
                                relation_id=None,
                            )
                        )

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
    uploaded_entity_models: Dict[Tuple[str, str], Entity] = {}

    # Build a map from the within-paper entity IDs to database row IDs. It is assumed that the
    # number of entities already uploaded for this paper won't be so many that they can't all
    # be stored in memory.
    uploaded_entities = Entity.select().where(
        Entity.paper_id == s2_id, Entity.version == data_version
    )
    for entity_model in uploaded_entities:
        uploaded_entity_models[
            (entity_model.type, entity_model.within_paper_id)
        ] = entity_model

    def resolve_model(entity_type: str, within_paper_id: str) -> Optional[Entity]:
        " Helper for resolving an entity ID into a database row ID. "
        try:
            return uploaded_entity_models[(entity_type, within_paper_id)]
        except KeyError:
            logging.warning(  # pylint: disable=logging-not-lazy
                "Could not upload reference to entity %s of type "
                + "%s, because no database row ID could be found for the entity %s of type "
                + "%s. Check to make sure the data for entities of type %s have been uploaded.",
                within_paper_id,
                entity_type,
                within_paper_id,
                entity_type,
                entity_type,
            )
            return None

    entity_relationship_models: List[EntityDataModel] = []
    for entity in entities:

        # Get the row ID for the entity.
        model = resolve_model(entity.type_, entity.id_)
        if model is None or entity.relationships is None:
            continue

        for k, v in entity.relationships.items():
            if isinstance(v, EntityReference):
                referenced_model = resolve_model(v.type_, v.id_)
                if referenced_model is not None:
                    entity_relationship_models.append(
                        EntityDataModel(
                            entity_id=model,
                            key=k,
                            value=referenced_model.id,
                            item_type="relation-id",
                            of_list=False,
                            relation_type=v.type_,
                        )
                    )
            elif (
                isinstance(v, list) and len(v) > 0 and isinstance(v[0], EntityReference)
            ):
                for reference in v:
                    referenced_model = resolve_model(reference.type_, reference.id_)
                    if referenced_model is not None:
                        entity_relationship_models.append(
                            EntityDataModel(
                                entity_id=model,
                                key=k,
                                value=referenced_model.id,
                                item_type="relation-id",
                                of_list=True,
                                relation_type=reference.type_,
                            )
                        )

    EntityDataModel.bulk_create(entity_relationship_models, 200)
