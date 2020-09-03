import os.path
from collections import defaultdict
from typing import Dict, List, Optional, cast

from common import directories, file_utils
from common.bounding_box import cluster_boxes
from common.types import (
    BoundingBox,
    EntityInformation,
    EntityReference,
    PaperProcessingResult,
    Term,
)
from common.upload_entities import upload_entities
from entities.sentences.types import Context


def upload_terms(
    processing_summary: PaperProcessingResult, data_version: Optional[int]
) -> None:

    arxiv_id = processing_summary.arxiv_id
    contexts = file_utils.load_from_csv(
        os.path.join(
            directories.arxiv_subdir("contexts-for-glossary-terms", arxiv_id),
            "contexts.csv",
        ),
        Context,
    )
    contexts_by_entity = {(c.tex_path, c.entity_id): c for c in contexts}

    # Assemble contexts that should be shown for each term.
    contexts_by_term: Dict[str, List[Context]] = defaultdict(list)
    for entity_and_location in processing_summary.localized_entities:
        term = cast(Term, entity_and_location.entity)
        if (term.tex_path, term.id_) in contexts_by_entity:
            contexts_by_term[term.text].append(
                contexts_by_entity[(term.tex_path, term.id_)]
            )

    entity_infos = []
    for entity_and_location in processing_summary.localized_entities:
        term = cast(Term, entity_and_location.entity)
        context = contexts_by_entity.get((term.tex_path, term.id_))
        boxes = [cast(BoundingBox, l) for l in entity_and_location.locations]

        # Cluster bounding boxes, in case any of these terms are defined as a macro (in which)
        # case all appearances of that term on the same page will have been lumped together.
        clusters = cluster_boxes(boxes, vertical_split=0.005)
        for i, cluster in enumerate(clusters):
            entity_info = EntityInformation(
                id_=f"{term.tex_path}-{term.id_}-{i}",
                type_="term",
                bounding_boxes=list(cluster),
                data={
                    "name": term.text,
                    "definitions": term.definitions,
                    "definition_texs": term.definitions,
                    "sources": term.sources,
                    "snippets": [
                        c.snippet for c in contexts_by_term.get(term.text, [])
                    ],
                },
                relationships={
                    "sentence": EntityReference(
                        type_="sentence",
                        id_=f"{context.tex_path}-{context.sentence_id}"
                        if context is not None
                        else None,
                    ),
                    "snippet_sentences": [
                        EntityReference(
                            type_="sentence", id_=f"{c.tex_path}-{c.sentence_id}"
                        )
                        for c in contexts_by_term.get(term.text, [])
                    ],
                },
            )
            entity_infos.append(entity_info)

    upload_entities(
        processing_summary.s2_id,
        processing_summary.arxiv_id,
        entity_infos,
        data_version,
    )
