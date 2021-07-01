from common import directories
from common.commands.base import CommandList
from common.commands.locate_entities import make_locate_entities_command
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .colorize import colorize_citations
from .commands.extract_bibitems import ExtractBibitems
from .commands.locate_citations import LocateCitations
from .commands.resolve_bibitems import ResolveBibitems
from .commands.upload_citations import UploadCitations
from .commands.write_citations_output import WriteCitationsOutput
from .make_digest import make_digest
from .types import Bibitem

directories.register("detected-citations")
directories.register("bibitem-resolutions")
directories.register("sources-with-colorized-citation-fragments")
directories.register("compiled-sources-with-colorized-citation-fragments")
directories.register("paper-images-with-colorized-citation-fragments")
directories.register("diffed-images-with-colorized-citation-fragments")
directories.register("citation-fragments-locations")
directories.register("citations-locations")
directories.register("sources-with-annotated-symbols")


commands: CommandList = [
    ExtractBibitems,
    ResolveBibitems,
    make_locate_entities_command(
        entity_name="citation-fragments",
        input_entity_name="citations",
        DetectedEntityType=Bibitem,
        colorize_func=colorize_citations,
    ),
    LocateCitations,
    UploadCitations,
]

citations_pipeline = EntityPipeline("citations", commands, make_digest=make_digest)
register_entity_pipeline(citations_pipeline)

# TODO: fix the fact that common commands will run twice
# alternate_commands = [command for command in commands if command != UploadCitations] + [WriteCitationsOutput]
# citations_alternate_pipeline = EntityPipeline("citations-alternate", alternate_commands, make_digest=make_digest)
# register_entity_pipeline(citations_alternate_pipeline)
