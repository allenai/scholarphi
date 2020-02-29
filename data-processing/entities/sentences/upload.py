from peewee import ForeignKeyField, TextField

from common.models import OutputModel, Paper
from common.types import PaperProcessingSummary


class Sentence(OutputModel):
    paper = ForeignKeyField(Paper, on_delete="CASCADE")
    text = TextField()


def upload_sentences(processing_summary: PaperProcessingSummary) -> None:

    arxiv_id = processing_summary.arxiv_id
    s2_id = processing_summary.s2_id
    entity_infos = processing_summary.entity_infos

    # Create entry for the paper if it does not yet exist
    try:
        paper = Paper.get(Paper.s2_id == s2_id)
    except Paper.DoesNotExist:
        paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

    for sentence in entity_infos:
        index = sentence.colorization_record

    # I'M STUCK HERE. I DON'T KNOW HOW TO EXPRESS A UNIQUE ID FOR SENTENCES, OR
    # HOW TO ACCESS UNIQUE DATA FOR THEM. MIGHT NEED TO DEFINE AN EXTRACTOR...

    # Create all symbols in bulk. This lets us resolve their IDs before we start referring to
    # them from other tables. It also lets us refer to their models in the parent-child table.
    # symbol_models: Dict[SymbolId, SymbolModel] = {}
    # symbol_models_by_symbol_object_id: Dict[int, SymbolModel] = {}

    # for symbol_with_id in symbols_with_ids:
    #     symbol = symbol_with_id.symbol
    #     symbol_id = symbol_with_id.symbol_id
    #     mathml_model = mathml_cache[symbol.mathml]
    #     symbol_model = SymbolModel(paper=paper, mathml=mathml_model)
    #     symbol_models[symbol_id] = symbol_model
    #     symbol_models_by_symbol_object_id[id(symbol)] = symbol_model

    # with output_database.atomic():
    #     SymbolModel.bulk_create(symbol_models.values(), 300)

    # # Upload bounding boxes for symbols. 'bulk_create' must have already been called on the
    # # the symbol models to make sure their model IDs can be used here.
    # entities = []
    # entity_bounding_boxes = []
    # bounding_boxes = []
    # for symbol_with_id in symbols_with_ids:

    #     symbol_id = symbol_with_id.symbol_id
    #     symbol_model = symbol_models[symbol_id]

    #     box = boxes.get(symbol_id)
    #     if box is not None:
    #         entity = Entity(
    #             type="symbol", source="tex-pipeline", entity_id=symbol_model.id
    #         )
    #         entities.append(entity)
    #         bounding_box = BoundingBoxModel(
    #             page=box.page,
    #             left=box.left,
    #             top=box.top,
    #             width=box.width,
    #             height=box.height,
    #         )
    #         bounding_boxes.append(bounding_box)

    #         entity_bounding_box = EntityBoundingBox(
    #             bounding_box=bounding_box, entity=entity
    #         )
    #         entity_bounding_boxes.append(entity_bounding_box)

    # with output_database.atomic():
    #     BoundingBoxModel.bulk_create(bounding_boxes, 100)
    # with output_database.atomic():
    #     Entity.bulk_create(entities, 300)
    # with output_database.atomic():
    #     EntityBoundingBox.bulk_create(entity_bounding_boxes, 300)

    # # Upload parent-child relationships between symbols.
    # symbol_child_models = []
    # for symbol_with_id in symbols_with_ids:

    #     symbol = symbol_with_id.symbol
    #     symbol_id = symbol_with_id.symbol_id
    #     symbol_model = symbol_models[symbol_id]

    #     for child in symbol.children:
    #         child_model = symbol_models_by_symbol_object_id[id(child)]
    #         symbol_child_models.append(
    #             SymbolChild(parent=symbol_model, child=child_model)
    #         )
    # with output_database.atomic():
    #     SymbolChild.bulk_create(symbol_child_models, 300)
