from typing import cast

from common import directories
from common.colorize_tex import ColorizeOptions
from common.commands.base import CommandList
from common.commands.locate_entities import make_locate_entities_command
from common.commands.upload_entities import make_upload_entities_command
from common.types import SerializableEntity
from entities.sentences.commands.extract_contexts import make_extract_contexts_command
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .commands.create_annotation_files import CreateAnnotationFiles
from .commands.detect_definitions import DetectDefinitions
from .commands.tokenize_sentences import TokenizeSentences
from .types import Definiendum, Definition, TermReference
from .upload import upload_definitions

# Register directories for output from intermediate pipeline stages.
directories.register("sentence-tokens")
directories.register("annotation-files")
directories.register("detected-definitions")
directories.register("contexts-for-definitions")
directories.register("sources-with-colorized-definitions")
directories.register("compiled-sources-with-colorized-definitions")
directories.register("paper-images-with-colorized-definitions")
directories.register("diffed-images-with-colorized-definitions")
directories.register("definitions-locations")


upload_command = make_upload_entities_command(
    "definitions",
    upload_definitions,
    DetectedEntityType={
        "entities-definiendums.csv": Definiendum,
        "entities-definitions.csv": Definition,
        "entities-term-references.csv": TermReference,
    },
)


def exclude_symbols(entity: SerializableEntity) -> bool:
    if entity.id_.startswith("definiendum"):
        definiendum = cast(Definiendum, entity)
        return definiendum.type_ != "symbol"
    if entity.id_.startswith("term"):
        term_reference = cast(TermReference, entity)
        return term_reference.type_ != "symbol"
    return True


commands: CommandList = [
    TokenizeSentences,
    CreateAnnotationFiles,
    DetectDefinitions,
    make_extract_contexts_command(entity_name="definitions"),
    make_locate_entities_command(
        "definitions",
        # Do not locate terms that are symbols because these will already be detect more
        # robustly in dedicated commands for symbol localization.
        colorize_options=ColorizeOptions(when=exclude_symbols),
    ),
    upload_command,
]


definitions_pipeline = EntityPipeline(
    "definitions", commands, depends_on=["symbols", "sentences"],
)
register_entity_pipeline(definitions_pipeline)
