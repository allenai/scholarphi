import logging
from collections import defaultdict
import os
from typing import Dict, List, Optional, Tuple, cast

from common import file_utils
from common.colorize_tex import EntityId
from common.models import EntityData as EntityDataModel
from common.models import output_database
from common.types import (
    BoundingBox,
    Context,
    EntityData,
    EntityReference,
    EntityRelationships,
    EntityUploadInfo,
    MathML,
    PaperProcessingResult,
    SerializableEntity,
    Symbol,
)
from common.upload_entities import (
    fetch_entity_models,
    make_data_models,
    make_relationship_models,
    save_to_file_or_upload_entities,
    write_to_file,
)
from entities.symbols.upload import sid

from .types import Definiendum, TermReference


def upload_definitions(
    processing_summary: PaperProcessingResult, data_version: Optional[int], output_dir: Optional[str]
) -> None:

    # Separate out txtual terms and symbols and process them separately. While references
    # to textual terms are found by a set of commands for textual definitions, references to
    # symbols are found in a separate set of commands that exclusively detect symbols.
    # The 'upload_symbol_definitions' function, therefore, needs to integrate data extracted
    # from the definition commands and symbols commands.
    upload_term_definitions(processing_summary, data_version, output_dir)
    upload_symbol_definitions(processing_summary, data_version, output_dir)


TermName = str


def is_textual_term(entity: SerializableEntity) -> bool:
    TEXTUAL_TERM_TYPES = ["abbreviation", "term"]

    if entity.id_.startswith("definiendum"):
        definiendum = cast(Definiendum, entity)
        return definiendum.type_ in TEXTUAL_TERM_TYPES
    if entity.id_.startswith("term"):
        term = cast(TermReference, entity)
        return term.type_ in TEXTUAL_TERM_TYPES

    return False


def upload_term_definitions(
    processing_summary: PaperProcessingResult, data_version: Optional[int], output_dir: Optional[str]
) -> None:
    " Upload textual terms and their definitions. "

    # Group contextual snippets for each term.
    term_infos = []
    contexts_by_term_name: Dict[TermName, List[Context]] = defaultdict(list)
    for entity_summary in processing_summary.entities:
        entity = entity_summary.entity
        context = entity_summary.context
        if is_textual_term(entity) and context is not None:
            contexts_by_term_name[entity.text].append(context)  # type: ignore

    # Construct mapping from definitions to the sentences that contain them.
    contexts_by_definition: Dict[EntityId, Context] = {}
    for entity_summary in processing_summary.entities:
        entity_id = entity_summary.entity.id_
        context = entity_summary.context
        if (entity_id.startswith("definition")) and context is not None:
            contexts_by_definition[entity_id] = context

    # Upload information for each term.
    for entity_summary in processing_summary.entities:
        boxes = [cast(BoundingBox, l) for l in entity_summary.locations]
        entity = entity_summary.entity
        context = entity_summary.context

        if not is_textual_term(entity):
            continue

        term = cast(TermReference, entity)

        # Assemble list of snippets that include this term.
        contexts_matching_term = contexts_by_term_name.get(term.text, [])
        snippets = [c.snippet for c in contexts_matching_term]
        snippet_sentences = [
            f"{c.tex_path}-{c.sentence_id}" for c in contexts_matching_term
        ]

        # Create links to the sentences containing definitions for this term.
        definition_sentences: List[Optional[str]] = []
        for definition_id in term.definition_ids:
            if definition_id not in contexts_by_definition:
                definition_sentences.append(None)
            definition_context = contexts_by_definition[definition_id]
            definition_sentences.append(
                f"{definition_context.tex_path}-{definition_context.sentence_id}"
            )

        term_info = EntityUploadInfo(
            id_=term.id_,
            type_="term",
            bounding_boxes=boxes,
            data={
                "name": term.text,
                "term_type": term.type_ or "unknown",
                "definitions": term.definitions,
                "definition_texs": term.definition_texs,
                "sources": term.sources,
                # A list of all other sentences the term appearse elsewhere in the paper.
                "snippets": snippets,
            },
            relationships={
                # Link the term to the sentence it belongs to. This link is necessary to enable
                # visual filtering in the UI where, when a term is clicked, the sentence is
                # highlighted and all others are lowlighted.
                "sentence": EntityReference(
                    type_="sentence",
                    id_=f"{context.tex_path}-{context.sentence_id}"
                    if context is not None
                    else None,
                ),
                # IDs of the sentences that contain each of the definitions for a term. These IDs
                # can be used to establish links that take a user to the site of a definition.
                "definition_sentences": [
                    EntityReference(type_="sentence", id_=id_)
                    for id_ in definition_sentences
                ],
                # The IDs of each sentence where the term appears elsewhere in the paper (i.e.,
                # for each of the 'snippets' in the entity data above. Used to link from a snippet
                # that is shown in a list of snippets to where that snippet appears in the paper.
                "snippet_sentences": [
                    EntityReference(type_="sentence", id_=id_)
                    for id_ in snippet_sentences
                ],
            },
        )
        term_infos.append(term_info)

    save_to_file_or_upload_entities(
        entity_infos=term_infos,
        s2_id=processing_summary.s2_id,
        arxiv_id=processing_summary.arxiv_id,
        data_version=data_version,
        output_dir=output_dir,
        filename="definitions_terms.jsonl"
    )


TexPath = str
EquationIndex = int


def upload_symbol_definitions(
    processing_summary: PaperProcessingResult, data_version: Optional[int], output_dir: Optional[str]
) -> None:
    " Upload symbols and their definitions. "

    writing_to_db = output_dir is None

    # Associate definitions with symbols as follows:
    # Definitions will be associated with entire equations as per the current implementation
    # of the definition detector. Conservatively, associate a definition for an equation
    # with a single symbol only if that symbol is the *only* top-level symbol in that equation.

    # Load symbols from files. Group symbols by equation to make it easy to detect whether a
    # symbol is the only top-level symbol in the equation.
    symbols_by_equation: Dict[
        Tuple[TexPath, EquationIndex], List[Symbol]
    ] = defaultdict(list)
    symbols: List[Symbol] = []

    symbols_with_ids = file_utils.load_symbols(processing_summary.arxiv_id)
    if symbols_with_ids is None:
        logging.info(  # pylint: disable=logging-not-lazy
            "No symbols were loaded for paper %s. Therefore, no definitions for symbols "
            + "will be uploaded for this paper.",
            processing_summary.arxiv_id,
        )
        return

    for _, symbol in symbols_with_ids:
        symbols_by_equation[symbol.tex_path, symbol.equation_index].append(symbol)
        symbols.append(symbol)

    # Group symbols by their MathML. These groups will be used to propagate definitions from
    # one defined symbol to all other appearances of that symbol.
    symbols_by_mathml: Dict[MathML, List[Symbol]] = defaultdict(list)
    for symbol in symbols:
        symbols_by_mathml[symbol.mathml].append(symbol)

    # Construct map from definitions to the sentences that contain them.
    contexts_by_definition: Dict[EntityId, Context] = {}
    for entity_summary in processing_summary.entities:
        entity_id = entity_summary.entity.id_
        context = entity_summary.context
        if (entity_id.startswith("definition")) and context is not None:
            contexts_by_definition[entity_id] = context

    if writing_to_db:
        # Fetch rows for all entities for this paper that have already been uploaded to the database.
        # This allows lookup of the row IDs for the sentence that contain definitions of symbols.
        entity_models = fetch_entity_models(processing_summary.s2_id, data_version)
    else:
        entity_models = {}

    # Create a list of rows to insert into the database containing definition data.
    # We'll only use this if we're writing to the db
    entity_data_models: List[EntityDataModel] = []
    # we'll only use this if we're not writing to the db
    entity_infos: List[EntityUploadInfo] = []

    for entity_summary in processing_summary.entities:
        entity = entity_summary.entity
        if not entity.id_.startswith("definiendum"):
            continue

        # Attempt to match definienda (defined terms) to symbols that are being defined.
        definiendum = cast(Definiendum, entity)
        defined_symbol = None
        for symbol in symbols:
            # Is the definiendum an equation?
            if definiendum.type_ != "symbol":
                continue
            # Does the symbol fall within in the range of characters being defined?
            if symbol.start < definiendum.start or symbol.end > definiendum.end:
                continue
            # Is the symbol a top-level symbol?
            if symbol.parent is not None:
                continue
            # Is it the *only* top-level symbol in its equation?
            top_level_symbols_in_equation = filter(
                lambda s: s.parent is not None,
                symbols_by_equation[(symbol.tex_path, symbol.equation_index)],
            )
            if len(list(top_level_symbols_in_equation)) > 1:
                continue

            defined_symbol = symbol
            logging.debug(  # pylint: disable=logging-not-lazy
                "Matched definiedum %s at position (%d, %d) to symbol %s at position "
                + "(%s, %s) for paper %s. A definition for this symbol will be uploaded.",
                definiendum.tex,
                definiendum.start,
                definiendum.end,
                symbol.tex,
                symbol.start,
                symbol.end,
                processing_summary.arxiv_id,
            )
            break

        if defined_symbol is None:
            continue

        # Assemble data about definitions for the symbol.
        definitions = definiendum.definitions
        definition_texs = definiendum.definition_texs
        sources = definiendum.sources
        definition_sentence_ids: List[Optional[str]] = []
        for definition_id in definiendum.definition_ids:
            context = contexts_by_definition.get(definition_id)
            if context is None:
                definition_sentence_ids.append(None)
            else:
                definition_sentence_ids.append(
                    f"{context.tex_path}-{context.sentence_id}"
                )

        # Find all symbols that are the same (i.e., that have the same MathML representation).
        # Then save definition data so that it applies all of those symbols.
        matching_symbols = symbols_by_mathml.get(defined_symbol.mathml)
        if matching_symbols is not None:
            for s in matching_symbols:
                entity_upload_info = EntityUploadInfo(
                    id_=sid(s),
                    type_="symbol",
                    bounding_boxes=[],
                    data={
                        "definitions": definitions,
                        "definition_texs": definition_texs,
                        "sources": sources,
                    },
                    relationships={
                        "definition_sentences": [
                            EntityReference(type_="sentence", id_=id_)
                            for id_ in definition_sentence_ids
                        ],
                    }
                )

                if writing_to_db:
                    entity_model = entity_models.get((entity_upload_info.type_, entity_upload_info.id_))

                    # Otherwise mypy complains.
                    assert entity_upload_info.data is not None, "Impossible."
                    entity_data_models.extend(make_data_models(None, entity_model, entity_upload_info.data))

                    # Otherwise mypy complains.
                    assert entity_upload_info.relationships is not None, "Impossible."
                    entity_data_models.extend(
                        make_relationship_models(
                            (entity_upload_info.type_, entity_upload_info.id_), entity_upload_info.relationships, entity_models
                        )
                    )
                else:
                    entity_infos.append(entity_upload_info)

    if writing_to_db:
        # double check
        assert len(entity_infos) == 0, "Expected empty entity_infos as we are writing to the db."

        with output_database.atomic():
            EntityDataModel.bulk_create(entity_data_models, 200)
    else:
        # otherwise mypy complains
        assert output_dir is not None, "Impossible."

        # double check
        assert len(entity_data_models) == 0, "Expected empty entity_data_models as we are not writing to the db."

        output_filename = os.path.join(output_dir, "definitions_symbols.jsonl")
        write_to_file(entity_infos=entity_infos, output_file_name=output_filename)
