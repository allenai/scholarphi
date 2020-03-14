from common import directories
from common.commands.base import CommandList
from common.commands.compile_tex import make_compile_tex_command
from common.commands.diff_images import make_diff_images_command
from common.commands.locate_hues import make_locate_hues_command
from common.commands.raster_pages import make_raster_pages_command
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .commands.colorize_citations import ColorizeCitations
from .commands.extract_bibitems import ExtractBibitems
from .commands.locate_citations import LocateCitations
from .commands.resolve_bibitems import ResolveBibitems
from .commands.upload_citations import UploadCitations
from .make_digest import make_digest

directories.register("bibitems")
directories.register("bibitem-resolutions")
directories.register("sources-with-colorized-citations")
directories.register("compiled-sources-with-colorized-citations")
directories.register("paper-with-colorized-citations-images")
directories.register("diff-images-with-colorized-citations")
directories.register("hue-locations-for-citations")
directories.register("citation-locations")
directories.register("sources-with-annotated-symbols")


commands: CommandList = [
    ExtractBibitems,
    ResolveBibitems,
    ColorizeCitations,
    make_compile_tex_command("citations"),
    make_raster_pages_command("citations"),
    make_diff_images_command("citations"),
    make_locate_hues_command("citations"),
    LocateCitations,
    UploadCitations,
]

citations_pipeline = EntityPipeline("citations", commands, make_digest=make_digest)
register_entity_pipeline(citations_pipeline)
