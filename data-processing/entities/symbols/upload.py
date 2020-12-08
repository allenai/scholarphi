import logging
import os.path
from collections import defaultdict
from typing import Dict, List, Optional, Set, cast

from common import directories, file_utils
from common.colorize_tex import wrap_span
from common.types import (
    BoundingBox,
    EntityData,
    EntityInformation,
    EntityReference,
    EntityRelationships,
    Match,
    Matches,
    PaperProcessingResult,
    SerializableChild,
    SerializableSymbol,
)
from common.upload_entities import upload_entities
from entities.sentences.types import Context
from entities.symbols.types import DefiningFormula

SymbolId = str


def sid(symbol: SerializableSymbol) -> SymbolId:
    return f"{symbol.tex_path}-{symbol.equation_index}-{symbol.symbol_index}"


def upload_symbols(
    processing_summary: PaperProcessingResult, data_version: Optional[int]
) -> None:

    arxiv_id = processing_summary.arxiv_id
    entities = [el.entity for el in processing_summary.localized_entities]
    symbols = cast(List[SerializableSymbol], entities)
    symbols_by_id = {sid(s): s for s in symbols}

    entity_infos: List[EntityInformation] = []

    # Load MathML matches for partially matching of symbols.
    matches: Matches = {}
    matches_path = os.path.join(
        directories.arxiv_subdir("symbol-matches", processing_summary.arxiv_id),
        "matches.csv",
    )
    if os.path.exists(matches_path):
        for match in file_utils.load_from_csv(matches_path, Match):
            if match.queried_mathml not in matches:
                matches[match.queried_mathml] = []
            matches[match.queried_mathml].append(match)
    else:
        logging.warning(
            "Could not find symbol matches information for paper %s.", arxiv_id,
        )

    # Load parent-child relationships for symbols.
    children: Dict[SymbolId, List[SymbolId]] = defaultdict(list)
    parents: Dict[SymbolId, SymbolId] = {}
    children_path = os.path.join(
        directories.arxiv_subdir("detected-symbols", arxiv_id), "symbol_children.csv"
    )
    if os.path.exists(children_path):
        for parent in file_utils.load_from_csv(children_path, SerializableChild):
            pid = f"{parent.tex_path}-{parent.equation_index}-{parent.symbol_index}"
            cid = f"{parent.tex_path}-{parent.equation_index}-{parent.child_index}"
            parents[cid] = pid
            children[pid].append(cid)
    else:
        logging.warning(
            "Could not find file mapping from symbol to their children for paper %s.",
            arxiv_id,
        )

    # Load contexts that the symbols appear in. Sort them by the symbol MathML.
    context_data_missing = False
    contexts_path = os.path.join(
        directories.arxiv_subdir("contexts-for-symbols", arxiv_id), "contexts.csv",
    )
    if not os.path.exists(contexts_path):
        logging.warning(  # pylint: disable=logging-not-lazy
            "Contexts have not been found for symbols for arXiv paper %s. "
            + "Symbol data will be uploaded without contexts.",
            arxiv_id,
        )
        context_data_missing = True

    symbol_contexts = {}
    mathml_contexts = defaultdict(list)
    if not context_data_missing:
        for context in file_utils.load_from_csv(contexts_path, Context):
            tex_path = context.tex_path
            symbol_id = f"{tex_path}-{context.entity_id}"
            symbol_contexts[symbol_id] = context
            symbol = symbols_by_id[symbol_id]
            mathml_contexts[symbol.mathml].append(context)

    # Prepare collections of formulae that each symbol was found in.
    symbol_formulas = {}
    mathml_formulas: Dict[str, Set[DefiningFormula]] = defaultdict(set)
    for symbol in symbols:
        if (
            symbol.is_definition
            and symbol.equation is not None
            and symbol.relative_start is not None
            and symbol.relative_end is not None
        ):
            highlighted = wrap_span(
                symbol.equation,
                symbol.relative_start,
                symbol.relative_end,
                before=r"\htmlClass{match-highlight}{",
                after="}",
                braces=True,
            )
            formula = DefiningFormula(
                tex=highlighted,
                tex_path=symbol.tex_path,
                equation_id=str(symbol.equation_index),
            )
            symbol_formulas[sid(symbol)] = formula
            mathml_formulas[symbol.mathml].add(formula)

    entity_infos = []
    for localized_entity in processing_summary.localized_entities:

        symbol = cast(SerializableSymbol, localized_entity.entity)
        boxes = [
            BoundingBox(l.left, l.top, l.width, l.height, l.page)
            for l in localized_entity.locations
        ]

        # TODO(andrewhead): move this filtering condition into 'parse_equation'
        if symbol.tex in ["$|$", "|"]:
            continue

        # Get context and formula of the symbol, and other matching ones.
        symbol_context = symbol_contexts.get(sid(symbol))
        matching_contexts = mathml_contexts.get(symbol.mathml, [])
        other_context_texs = []
        other_context_sentence_ids = []
        for c in matching_contexts:
            matching_sentence_id = f"{c.tex_path}-{c.sentence_id}"
            if matching_sentence_id not in other_context_sentence_ids:
                other_context_texs.append(c.snippet)
                other_context_sentence_ids.append(matching_sentence_id)

        matching_formulas = mathml_formulas.get(symbol.mathml, set())
        other_formula_texs = []
        other_formula_ids = []
        for f in matching_formulas:
            equation_id = f"{f.tex_path}-{f.equation_id}"
            if equation_id not in other_formula_ids:
                other_formula_texs.append(f.tex)
                other_formula_ids.append(equation_id)

        # Package up data for the symbol.
        data: EntityData = {
            "tex": f"${symbol.tex}$",
            "tex_start": symbol.start,
            "tex_end": symbol.end,
            "mathml": symbol.mathml,
            "mathml_near_matches": [m.matching_mathml for m in matches[symbol.mathml]],
            "snippets": other_context_texs,
            "defining_formulas": other_formula_texs,
            "is_definition": symbol.is_definition or False,
        }

        # Create links between this symbol, its sentence, and related symbols.
        sentence_id = (
            f"{symbol_context.tex_path}-{symbol_context.sentence_id}"
            if symbol_context is not None
            else None
        )

        parent_id = parents.get(sid(symbol))
        child_ids = children.get(sid(symbol), [])

        relationships: EntityRelationships = {
            "equation": EntityReference(
                type_="equation", id_=f"{symbol.tex_path}-{symbol.equation_index}",
            ),
            "parent": EntityReference(type_="symbol", id_=parent_id),
            "children": [EntityReference(type_="symbol", id_=id_) for id_ in child_ids],
            "sentence": EntityReference(type_="sentence", id_=sentence_id)
            if sentence_id is not None
            else EntityReference(type_="sentence", id_=None),
            "defining_formula_equations": [
                EntityReference(type_="equation", id_=id_) for id_ in other_formula_ids
            ],
            "snippet_sentences": [
                EntityReference(type_="sentence", id_=id_)
                for id_ in other_context_sentence_ids
            ],
        }

        # Save all data for this symbol
        entity_information = EntityInformation(
            id_=sid(symbol),
            type_="symbol",
            bounding_boxes=boxes,
            data=data,
            relationships=relationships,
        )
        entity_infos.append(entity_information)

    upload_entities(
        processing_summary.s2_id, arxiv_id, entity_infos, data_version,
    )
