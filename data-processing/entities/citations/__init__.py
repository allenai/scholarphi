from common import directories
from common.commands.base import CommandList
from common.commands.locate_entities import make_locate_entities_command
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .colorize import colorize_citations
from .commands.extract_bibitems import ExtractBibitems
from .commands.locate_citations import LocateCitations
from .commands.resolve_bibitems import ResolveBibitems
from .commands.upload_citations import UploadCitations
from .make_digest import make_digest
from .types import Bibitem

directories.register("detected-citations")
directories.register("bibitem-resolutions")
directories.register("sources-with-colorized-citations")
directories.register("compiled-sources-with-colorized-citations")
directories.register("paper-images-with-colorized-citations")
directories.register("diffed-images-with-colorized-citations")
directories.register("citations-locations")
directories.register("citation-cluster-locations")
directories.register("sources-with-annotated-symbols")


commands: CommandList = [
    ExtractBibitems,
    ResolveBibitems,
    make_locate_entities_command(
        "citations", DetectedEntityType=Bibitem, colorize_func=colorize_citations
    ),
    LocateCitations,
    UploadCitations,
]

citations_pipeline = EntityPipeline("citations", commands, make_digest=make_digest)
register_entity_pipeline(citations_pipeline)
