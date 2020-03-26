from typing import List, Dict

from .types import SymbolData, SymbolKey, SentenceKey
from .models import MathMl as MathMlModel
from .models import MathMlMatch, SymbolChild, SymbolSentence
from .models import Symbol as SymbolModel
from common.types import MathML, SymbolId
from common.models import BoundingBox as BoundingBoxModel
from common.models import output_database, Paper, Entity, EntityBoundingBox


def upload_symbols(item: SymbolData, source: str = "tex-pipeline") -> None:
    arxiv_id = item.arxiv_id
    s2_id = item.s2_id
    symbols_with_ids = item.symbols_with_ids
    boxes = item.boxes
    matches = item.matches

    try:
        paper = Paper.get(Paper.s2_id == s2_id)
    except Paper.DoesNotExist:
        paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

    # Load MathML models into cache; they will be needed for creating multiple symbols.
    mathml_cache: Dict[MathML, MathMlModel] = {}
    mathml_equations = {swi.symbol.mathml for swi in symbols_with_ids}
    for mathml, mathml_matches in matches.items():
        mathml_equations.update(
            {mathml}.union({match.matching_mathml for match in mathml_matches})
        )
    for mathml in mathml_equations:
        if mathml not in mathml_cache:
            try:
                mathml_model = MathMlModel.get(MathMlModel.mathml == mathml)
            except MathMlModel.DoesNotExist:
                mathml_model = MathMlModel.create(mathml=mathml)
            mathml_cache[mathml] = mathml_model

    # Upload MathML search results.
    mathml_match_models = []
    for mathml, mathml_matches in matches.items():
        for match in mathml_matches:
            mathml_match_models.append(
                MathMlMatch(
                    paper=paper,
                    mathml=mathml_cache[mathml],
                    match=mathml_cache[match.matching_mathml],
                    rank=match.rank,
                )
            )
    with output_database.atomic():
        MathMlMatch.bulk_create(mathml_match_models, 200)

    # Create all symbols in bulk. This lets us resolve their IDs before we start referring to
    # them from other tables. It also lets us refer to their models in the parent-child table.
    symbol_models: Dict[SymbolId, SymbolModel] = {}
    symbol_models_by_symbol_object_id: Dict[int, SymbolModel] = {}

    for symbol_with_id in symbols_with_ids:
        symbol = symbol_with_id.symbol
        symbol_id = symbol_with_id.symbol_id
        mathml_model = mathml_cache[symbol.mathml]
        symbol_model = SymbolModel(paper=paper, mathml=mathml_model)
        symbol_models[symbol_id] = symbol_model
        symbol_models_by_symbol_object_id[id(symbol)] = symbol_model

    with output_database.atomic():
        SymbolModel.bulk_create(symbol_models.values(), 300)

    # Upload bounding boxes for symbols. 'bulk_create' must have already been called on the
    # the symbol models to make sure their model IDs can be used here.
    entities = []
    entity_bounding_boxes = []
    bounding_boxes = []
    for symbol_with_id in symbols_with_ids:

        symbol_id = symbol_with_id.symbol_id
        symbol_model = symbol_models[symbol_id]

        box = boxes.get(symbol_id)
        if box is not None:
            entity = Entity(
                type="symbol", source=source, entity_id=symbol_model.id
            )
            entities.append(entity)
            bounding_box = BoundingBoxModel(
                page=box.page,
                left=box.left,
                top=box.top,
                width=box.width,
                height=box.height,
            )
            bounding_boxes.append(bounding_box)

            entity_bounding_box = EntityBoundingBox(
                bounding_box=bounding_box, entity=entity
            )
            entity_bounding_boxes.append(entity_bounding_box)

    with output_database.atomic():
        BoundingBoxModel.bulk_create(bounding_boxes, 100)
    with output_database.atomic():
        Entity.bulk_create(entities, 300)
    with output_database.atomic():
        EntityBoundingBox.bulk_create(entity_bounding_boxes, 300)

    # Upload parent-child relationships between symbols.
    symbol_child_models = []
    for symbol_with_id in symbols_with_ids:

        symbol = symbol_with_id.symbol
        symbol_id = symbol_with_id.symbol_id
        symbol_model = symbol_models[symbol_id]

        for child in symbol.children:
            child_model = symbol_models_by_symbol_object_id[id(child)]
            symbol_child_models.append(
                SymbolChild(parent=symbol_model, child=child_model)
            )
    with output_database.atomic():
        SymbolChild.bulk_create(symbol_child_models, 300)

    # Upload links between symbols and the sentences they appear in.
    symbol_sentence_models = []
    for symbol_id, sentence_model_id in item.symbol_sentence_model_ids.items():
        symbol_model = symbol_models[symbol_id]
        symbol_sentence_models.append(
            SymbolSentence(symbol=symbol_model, sentence_id=sentence_model_id)
        )

    with output_database.atomic():
        SymbolSentence.bulk_create(symbol_sentence_models, 300)
