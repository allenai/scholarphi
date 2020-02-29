from typing import List, Optional, Type

from command.colorize_tex import make_colorize_tex_command
from command.command import Command
from command.compile_tex import make_compile_tex_command
from command.detect_entities import make_detect_entities_command
from command.diff_images import make_diff_images_command
from command.locate_hues import make_locate_hues_command
from command.raster_pages import make_raster_pages_command
from common.colorize_tex import ColorPositionsFunc, ColorWhenFunc
from common.parse_tex import EntityExtractor
from common.types import SerializableEntity


def create_entity_localization_command_sequence(
    entity_name: str,
    entity_type: str,
    EntityExtractorType: Type[EntityExtractor],
    DetectedEntityType: Optional[Type[SerializableEntity]] = None,
    colorize_entity_when: Optional[ColorWhenFunc] = None,
    get_color_positions: Optional[ColorPositionsFunc] = None,
) -> List[Type[Command]]:  # type: ignore
    """
    Create a set of commands that can be used to locate a new type of entity. In the simplest case,
    all you have to provide is and 'entity_name' to be used for naming output files, and
    'entity_type' that can be used to filter which commands are being run when you the full
    pipeline is run, and an 'EntityExtractorType' that locates all instances of that entity in the
    TeX. This function creates the commands necessary to colorize the entities, compile the
    LaTeX, raster the pages, and locate the colors in the pages. You may define additional
    paramters (e.g., 'colorize_entity_when') to fine-tune the commands.

    If you are trying to find the locations of a new type of entity, it is highly recommended that
    you use this convenience methods instead of creating new commands yourself.
    """
    return [
        make_detect_entities_command(entity_name, entity_type, EntityExtractorType),
        make_colorize_tex_command(
            entity_name=entity_name,
            entity_type=entity_type,
            DetectedEntityType=DetectedEntityType,
            when=colorize_entity_when,
            get_color_positions=get_color_positions,
        ),
        make_compile_tex_command(entity_name, entity_type),
        make_raster_pages_command(entity_name, entity_type),
        make_diff_images_command(entity_name, entity_type),
        make_locate_hues_command(entity_name, entity_type),
    ]
