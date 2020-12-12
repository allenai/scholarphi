from collections import defaultdict
from typing import Dict, List, Optional, cast

from common.colorize_tex import EntityId
from common.types import (
    BoundingBox,
    Context,
    EntityReference,
    EntityUploadInfo,
    PaperProcessingResult,
    SerializableEntity,
)
from common.upload_entities import upload_entities

from .types import Definiendum, TermReference


def upload_definitions(
    processing_summary: PaperProcessingResult, data_version: Optional[int]
) -> None:
    upload_term_definitions(processing_summary, data_version)


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
    processing_summary: PaperProcessingResult, data_version: Optional[int]
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
                "snippets": snippets,
            },
            relationships={
                "sentence": EntityReference(
                    type_="sentence",
                    id_=f"{context.tex_path}-{context.sentence_id}"
                    if context is not None
                    else None,
                ),
                "definition_sentences": [
                    EntityReference(type_="sentence", id_=id_)
                    for id_ in definition_sentences
                ],
                "snippet_sentences": [
                    EntityReference(type_="sentence", id_=id_)
                    for id_ in snippet_sentences
                ],
            },
        )
        term_infos.append(term_info)

    upload_entities(
        processing_summary.s2_id, processing_summary.arxiv_id, term_infos, data_version,
    )


def upload_symbol_definitions(
    processing_summary: PaperProcessingResult, data_version: Optional[int]
) -> None:

    # Load in all symbols

    # For each definition...
    pass
