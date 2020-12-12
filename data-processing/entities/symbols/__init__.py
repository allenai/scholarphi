from typing import Any, List, cast

from common import directories
from common.colorize_tex import overlaps
from common.commands.locate_entities import make_locate_entities_command
from common.commands.upload_entities import make_upload_entities_command
from common.make_digest import make_default_paper_digest
from common.types import (
    ArxivId,
    ColorizeOptions,
    EntityProcessingDigest,
    SerializableEntity,
    SerializableSymbol,
    SerializableToken,
)
from entities.sentences.commands.extract_contexts import make_extract_contexts_command
from entities.sentences.types import TexWrapper
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .colorize import adjust_color_positions
from .commands.collect_symbol_locations import CollectSymbolLocations
from .commands.extract_symbols import ExtractSymbols
from .commands.find_symbol_matches import FindSymbolMatches
from .commands.locate_composite_symbols import LocateCompositeSymbols
from .upload import upload_symbols

directories.register("detected-equation-tokens")
directories.register("detected-symbols")
directories.register("symbol-matches")
directories.register("contexts-for-symbols")
directories.register("sources-with-colorized-equation-tokens")
directories.register("compiled-sources-with-colorized-equation-tokens")
directories.register("paper-images-with-colorized-equation-tokens")
directories.register("diffed-images-with-colorized-equation-tokens")
directories.register("equation-tokens-locations")
directories.register("composite-symbols-locations")
directories.register("sources-with-colorized-symbols-with-affixes")
directories.register("compiled-sources-with-colorized-symbols-with-affixes")
directories.register("paper-images-with-colorized-symbols-with-affixes")
directories.register("diffed-images-with-colorized-symbols-with-affixes")
directories.register("symbols-with-affixes-locations")
directories.register("symbols-locations")


def filter_atom_tokens(entity: SerializableEntity) -> bool:
    """
    When locating tokens for equations, only detect atom tokens (i.e., skipping affix tokens like
    arrows and hats), because affixes be colorized by wrapping them in colorization commands.
    """
    token = cast(SerializableToken, entity)
    return token.type_ == "atom"


def filter_symbols_with_affixes(entity: SerializableEntity) -> bool:
    """
    Detect symbols that contain affixes differently from those that only contain atomic tokens.
    """
    symbol = cast(SerializableSymbol, entity)
    return symbol.contains_affix


def divide_symbols_into_nonoverlapping_groups(
    entities: List[SerializableEntity],
) -> List[List[SerializableEntity]]:
    """
    Symbols containing affixes need to be colored on their own, though they can overlap (e.g., a
    bar can appear above a symbol that is a subscript to another symbol). To avoid compliation
    issues, all overlapping entities are colorized in separate batches.
    """

    symbols = cast(List[SerializableSymbol], entities)
    groups: List[List[SerializableSymbol]] = [[]]

    for symbol in symbols:

        group_assigned = False
        for group in groups:
            if not any([overlaps(symbol, other) for other in group]):
                group.append(symbol)
                group_assigned = True
                break

        if not group_assigned:
            groups.append([symbol])

    return cast(List[List[SerializableEntity]], groups)


def entity_key_for_contexts(entity: SerializableEntity) -> Any:
    """
    When constructing snippets for the contexts symbols appear in, determine whether
    two symbols should be highlighted as the 'same symbol' using their MathML.
    """
    symbol = cast(SerializableSymbol, entity)
    return symbol.mathml


commands = [
    ExtractSymbols,
    FindSymbolMatches,
    make_extract_contexts_command(
        "symbols",
        EntityType=SerializableSymbol,
        entity_key=entity_key_for_contexts,
        tex_wrapper=TexWrapper(
            before=r"\htmlClass{match-highlight}{", after="}", braces=True
        ),
    ),
    make_locate_entities_command(
        "equation-tokens",
        DetectedEntityType=SerializableToken,
        colorize_options=ColorizeOptions(
            adjust_color_positions=adjust_color_positions,
            braces=True,
            when=filter_atom_tokens,
        ),
    ),
    make_locate_entities_command(
        "symbols-with-affixes",
        input_entity_name="symbols",
        DetectedEntityType=SerializableSymbol,
        colorize_options=ColorizeOptions(
            adjust_color_positions=adjust_color_positions,
            braces=True,
            when=filter_symbols_with_affixes,
            group=divide_symbols_into_nonoverlapping_groups,
        ),
    ),
    LocateCompositeSymbols,
    CollectSymbolLocations,
    make_upload_entities_command(
        "symbols", upload_symbols, DetectedEntityType=SerializableSymbol
    ),
]


def make_digest(_: str, arxiv_id: ArxivId) -> EntityProcessingDigest:
    """
    Custom digest creator. Count the equation tokens, instead of the 'symbols', as we can
    use the default entity counters for the outputs of equation token commands.
    """
    return make_default_paper_digest("equation-tokens", arxiv_id)


symbols_pipeline = EntityPipeline(
    "symbols", commands, depends_on=["equations", "sentences"], make_digest=make_digest,
)
register_entity_pipeline(symbols_pipeline)
