# from entities.common import register_entity
from typing import Iterator, List, Type

from command.raster_pages import make_raster_pages_command
from common import directories
from common.models import OutputModel
from common.parse_tex import EntityExtractor
from common.types import RelativePath


def register_entity(
    name: str, extractor: EntityExtractor, models: List[Type[OutputModel]]
) -> None:
    """
    'name' should be plural.
    """

    colorized_sources_dirkey = f"sources-with-colorized-{name}"
    compiled_sources_dirkey = f"compiled-sources-with-colorized-{name}"
    paper_images_dirkey = f"paper-with-colorized-{name}-images"
    diff_images_dirkey = f"diff-images-with-colorized-{name}"
    hue_locations_dirkey = f"hue-locations-for-{name}"
    locations_dirkey = f"{name}-locations"

    ColorizeTexCommand = ...
    CompileTexCommand = ...
    RasterPagesCommand = make_raster_pages_command(name)
    DiffImagesCommad = ...
    LocateHuesCommand = ...
    LocateEntitiesCommand = ...
