import csv
import logging
import os.path
from typing import Dict, Iterator, List, NamedTuple

from explanations import directories
from explanations.annotate_tex import AnnotatedFile, annotate_symbols_and_equations
from explanations.directories import get_data_subdirectory_for_arxiv_id
from explanations.file_utils import (
    clean_directory,
    load_symbols,
    load_tokens,
    read_file_tolerant,
)
from explanations.types import (
    ArxivId,
    Character,
    CharacterId,
    FileContents,
    Path,
    Symbol,
    SymbolId,
)
from explanations.unpack import unpack
from scripts.command import ArxivBatchCommand


class TexAndSymbols(NamedTuple):
    arxiv_id: ArxivId
    tex_contents: Dict[Path, FileContents]
    symbols: Dict[SymbolId, Symbol]
    characters: Dict[CharacterId, Character]


AnnotationResult = List[AnnotatedFile]


class AnnotateTexWithSymbolMarkers(ArxivBatchCommand[TexAndSymbols, AnnotationResult]):
    @staticmethod
    def get_name() -> str:
        return "annotate-tex-with-symbol-markers"

    @staticmethod
    def get_description() -> str:
        return "Annotate TeX with markers for all equations and symbols."

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_DIR

    def load(self) -> Iterator[TexAndSymbols]:
        for arxiv_id in self.arxiv_ids:

            output_root = get_data_subdirectory_for_arxiv_id(
                directories.SOURCES_WITH_ANNOTATED_SYMBOLS_DIR, arxiv_id
            )
            clean_directory(output_root)

            symbols_dir = directories.symbols(arxiv_id)
            tokens_path = os.path.join(symbols_dir, "tokens.csv")
            if not os.path.exists(tokens_path):
                logging.info(
                    "No equation token data found for paper %s. Skipping.", arxiv_id
                )
                continue

            symbols_with_ids = load_symbols(arxiv_id)
            if symbols_with_ids is None:
                continue
            symbols = {swi.symbol_id: swi.symbol for swi in symbols_with_ids}

            tokens = load_tokens(arxiv_id)
            if tokens is None:
                continue
            tex_paths = set({t.tex_path for t in tokens})

            characters: Dict[CharacterId, Character] = {}
            for token in tokens:
                character_id = CharacterId(
                    token.tex_path, token.equation_index, token.token_index
                )
                characters[character_id] = Character(
                    token.text, token.token_index, token.start, token.end
                )

            # Load original sources for TeX files that need to be colorized
            contents_by_file = {}
            for tex_path in tex_paths:
                absolute_tex_path = os.path.join(
                    directories.sources(arxiv_id), tex_path
                )
                file_contents = read_file_tolerant(absolute_tex_path)
                if file_contents is not None:
                    contents_by_file[tex_path] = file_contents

            yield TexAndSymbols(arxiv_id, contents_by_file, symbols, characters)

    def process(self, item: TexAndSymbols) -> Iterator[AnnotationResult]:
        annotated_files = annotate_symbols_and_equations(
            item.tex_contents, item.symbols, item.characters
        )
        yield annotated_files

    def save(self, item: TexAndSymbols, result: AnnotationResult) -> None:
        output_sources_path = get_data_subdirectory_for_arxiv_id(
            directories.SOURCES_WITH_ANNOTATED_SYMBOLS_DIR, item.arxiv_id
        )
        logging.debug("Outputting to %s", output_sources_path)

        # Create new directory for each colorization iteration.
        unpack_path = unpack(item.arxiv_id, output_sources_path)
        sources_unpacked = unpack_path is not None
        if unpack_path is None:
            logging.warning("Could not unpack sources into %s", output_sources_path)

        if sources_unpacked:
            for annotated_file in result:
                full_tex_path = os.path.join(
                    output_sources_path, annotated_file.tex_path
                )
                with open(
                    full_tex_path, "w", encoding=annotated_file.encoding
                ) as tex_file:
                    tex_file.write(annotated_file.contents)

            symbols_tex_path = os.path.join(output_sources_path, "symbol_tex.csv")
            with open(symbols_tex_path, "a") as symbols_tex_file:
                writer = csv.writer(symbols_tex_file, quoting=csv.QUOTE_ALL)
                for annotated_file in result:
                    for symbol_tex in annotated_file.symbol_tex:
                        writer.writerow([annotated_file.tex_path, symbol_tex])
