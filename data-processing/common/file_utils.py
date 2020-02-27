import csv
import dataclasses
import logging
import os
import shutil
from typing import Dict, Iterator, List, Optional, Type, TypeVar

from common import directories
from common.types import (
    ArxivId,
    BoundingBox,
    CharacterId,
    CompilationResult,
    Equation,
    EquationId,
    FileContents,
    HueIteration,
    Path,
    Symbol,
    SymbolId,
    SymbolWithId,
    TokenWithOrigin,
)

Contents = str
Encoding = str


def read_file_tolerant(path: str) -> Optional[FileContents]:
    """
    Attempt to read the contents of a file using several encodings.
    """
    for encoding in ["utf-8", "latin-1"]:
        with open(path, "r", encoding=encoding) as file_:
            try:
                return FileContents(path, file_.read(), encoding)
            except Exception:  # pylint: disable=broad-except
                logging.debug(
                    "Could not decode file %s using encoding %s", path, encoding
                )

    logging.error("Could not find an appropriate encoding for file %s", path)
    return None


Dataclass = TypeVar("Dataclass")


def append_to_csv(csv_path: Path, data_obj: Dataclass, encoding: str = "utf-8") -> None:
    """
    Append a data object to a CSV file. This function makes the following assumptions:
    * 'obj' is a dataclass. This code will check dynamically to make sure the object is a
      dataclass before writing it to file, and will do nothing if it is not.
    * 'obj''s dataclass is flat---that is, it consists of only primitive data types.
    * each 'obj' passed to this function for the same csv_path must be of the same dataclass type.
      It would not make sense to write objects with different sets of fields to the same CSV file.
      This function does not check to make sure that all the objects you pass
      in have the same format.
    """

    if not dataclasses.is_dataclass(data_obj):
        logging.error(  # pylint: disable=logging-not-lazy
            (
                "Object of type %s is not a dataclass. The code calling this append_to_csv function"
                + "must be rewritten to only attempt to write objects that are of a dataclass type"
            ),
            type(data_obj),
        )

    # Check to see whether the file is empty
    try:
        file_empty = os.stat(csv_path).st_size == 0
    except FileNotFoundError:
        file_empty = True

    with open(csv_path, "a", encoding=encoding) as csv_file:
        data_dict = dataclasses.asdict(data_obj)
        writer = csv.DictWriter(
            # QUOTE_NONNUMERIC is used in both the writer and the reader to ensure that numbers
            # (e.g., indexes, hues, positions) are decoded as numbers.
            csv_file,
            fieldnames=data_dict.keys(),
            quoting=csv.QUOTE_NONNUMERIC,
        )

        # Only write the header the first time a record is added to the file
        try:
            if file_empty:
                writer.writeheader()
            writer.writerow(data_dict)
        except Exception as exception:  # pylint: disable=broad-except
            logging.warning(
                "Couldn't write row containing data %s to CSV file. Reason: %s.",
                data_obj,
                exception,
            )


def load_from_csv(
    csv_path: Path, D: Type[Dataclass], encoding: str = "utf-8",
) -> Iterator[Dataclass]:
    """
    Load data from CSV file at 'csv_path', returning an iterator over objects of type 'D'.
    This method assumes that the CSV file was written by 'append_to_csv'. Key to this assumption is
    that each row of the CSV file has all of the data needed to populate an object of type 'D'. The
    headers in the CSV file must exactly match the property names of 'D'.
    """
    with open(csv_path, encoding=encoding, newline="") as csv_file:
        reader = csv.DictReader(csv_file, quoting=csv.QUOTE_NONNUMERIC)
        for row in reader:
            yield D(**row)  # type: ignore


def clean_directory(directory: str) -> None:
    """
    Remove all files and subdirectories from a directory; leave the directory.
    """
    if not os.path.exists(directory):
        return
    logging.debug("Cleaning directory %s", directory)
    for filename in os.listdir(directory):
        path = os.path.join(directory, filename)
        try:
            if os.path.isfile(path):
                os.unlink(path)
            elif os.path.isdir(path):
                shutil.rmtree(path)
        except Exception as e:  # pylint: disable=broad-except
            logging.warning(
                "Could not remove path %s from directory %s: %s", path, directory, e
            )


def find_files(
    dir_: str, extensions: List[str], relative: bool = False
) -> Iterator[str]:
    """
    Find all files in a directory with a given extension.
    """
    for (dirpath, _, filenames) in os.walk(dir_):
        for filename in filenames:
            __, ext = os.path.splitext(filename)
            if ext in extensions:
                path = os.path.join(dirpath, filename)
                if relative:
                    path = os.path.relpath(path, os.path.abspath(dir_))
                yield path


def _get_symbol_id(row: List[str]) -> SymbolId:
    """
    Get symbol ID for a row in a symbols data file.
    """
    return SymbolId(
        tex_path=row[0], equation_index=int(row[1]), symbol_index=int(row[3])
    )


def load_equations(arxiv_id: ArxivId) -> Optional[Dict[EquationId, Equation]]:
    equations_path = os.path.join(
        directories.arxiv_subdir("equations", arxiv_id), "equations.csv"
    )
    if not os.path.exists(equations_path):
        logging.warning("No equation data found for paper %s. Skipping.", arxiv_id)
        return None

    equations: Dict[EquationId, Equation] = {}
    with open(equations_path, encoding="utf-8") as equations_file:
        reader = csv.reader(equations_file)
        for row in reader:
            tex_path = row[0]
            equation_index = int(row[1])
            equation = Equation(
                int(row[9]),
                int(row[10]),
                int(row[1]),
                row[4],
                int(row[5]),
                int(row[6]),
                row[7],
                int(row[8]),
            )
            equation_id = EquationId(tex_path, equation_index)
            equations[equation_id] = equation

    return equations


def load_tokens(arxiv_id: ArxivId) -> Optional[List[TokenWithOrigin]]:
    equations = load_equations(arxiv_id)
    if equations is None:
        return None

    tokens_path = os.path.join(
        directories.arxiv_subdir("symbols", arxiv_id), "tokens.csv"
    )
    if not os.path.exists(tokens_path):
        logging.warning(
            "No equation token data found for paper %s. Skipping.", arxiv_id
        )
        return None

    # Load token location information
    tokens = []
    with open(tokens_path, encoding="utf-8") as tokens_file:
        reader = csv.reader(tokens_file)
        for row in reader:
            tex_path = row[0]
            equation_index = int(row[1])
            equation_id = EquationId(tex_path, equation_index)
            if equation_id not in equations:
                logging.warning(
                    "Couldn't find equation with ID %s for token", equation_id
                )
                continue
            tokens.append(
                TokenWithOrigin(
                    tex_path=tex_path,
                    equation=equations[equation_id],
                    token_index=int(row[3]),
                    start=int(row[4]),
                    end=int(row[5]),
                    text=row[6],
                )
            )

    return tokens


def load_symbols(arxiv_id: ArxivId) -> Optional[List[SymbolWithId]]:

    data_dir = directories.arxiv_subdir("symbols", arxiv_id)
    symbols_path = os.path.join(data_dir, "symbols.csv")
    symbol_tokens_path = os.path.join(data_dir, "symbol_tokens.csv")
    symbol_children_path = os.path.join(data_dir, "symbol_children.csv")

    file_not_found = False
    if not os.path.exists(symbols_path):
        logging.info("Symbols data missing for paper %s. Skipping.", arxiv_id)
        file_not_found = True
    if not os.path.exists(symbol_tokens_path):
        logging.info("Symbol tokens data missing for paper %s. Skipping.", arxiv_id)
        file_not_found = True
    if not os.path.exists(symbol_children_path):
        logging.info("Symbol children data missing for paper %s. Skipping.", arxiv_id)
        file_not_found = True

    if file_not_found:
        return None

    symbols_by_id: Dict[SymbolId, Symbol] = {}

    with open(symbols_path, encoding="utf-8") as symbols_file:
        reader = csv.reader(symbols_file)
        for row in reader:
            symbol_id = _get_symbol_id(row)
            mathml = row[4]
            symbols_by_id[symbol_id] = Symbol(characters=[], mathml=mathml, children=[])

    with open(symbol_tokens_path, encoding="utf-8") as symbol_tokens_file:
        reader = csv.reader(symbol_tokens_file)
        for row in reader:
            symbol_id = _get_symbol_id(row)
            character_index = int(row[4])
            symbols_by_id[symbol_id].characters.append(character_index)

    with open(symbol_children_path, encoding="utf-8") as symbol_children_file:
        reader = csv.reader(symbol_children_file)
        for row in reader:
            symbol = symbols_by_id[_get_symbol_id(row)]
            child_symbol_id = SymbolId(row[0], int(row[1]), int(row[4]))
            child_symbol = symbols_by_id[child_symbol_id]
            symbol.children.append(child_symbol)

    return [
        SymbolWithId(symbol_id, symbol) for symbol_id, symbol in symbols_by_id.items()
    ]


def save_compilation_results(path: Path, result: CompilationResult) -> None:
    results_dir = os.path.join(path, "compilation_results")
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)

    if result.success:
        logging.debug(
            "Successfully compiled TeX. Generated files: %s", str(result.output_files),
        )
        if len(result.output_files) > 1:
            logging.warning(  # pylint: disable=logging-not-lazy
                (
                    "More than one output file was produced by compiling TeX in %s. The pipeline "
                    + "does not know which one of these is the main output file, so entity "
                    + "localization for this paper may not work. See logs in %s."
                ),
                path,
                results_dir,
            )
    else:
        logging.warning(
            "Could not compile TeX in %s. See logs in %s.", path, results_dir
        )

    with open(os.path.join(results_dir, "result"), "w") as success_file:
        success_file.write(str(result.success))

    with open(os.path.join(results_dir, "output_files.csv"), "w") as output_files_file:
        writer = csv.writer(output_files_file, quoting=csv.QUOTE_ALL)
        for i, output_file in enumerate(result.output_files):
            writer.writerow([i, output_file.output_type, output_file.path])

    with open(os.path.join(results_dir, "stdout.log"), "wb") as stdout_file:
        stdout_file.write(result.stdout)

    with open(os.path.join(results_dir, "stderr.log"), "wb") as stderr_file:
        stderr_file.write(result.stderr)


def load_citation_hue_locations(
    arxiv_id: ArxivId,
) -> Optional[Dict[HueIteration, List[BoundingBox]]]:

    boxes_by_hue_iteration: Dict[HueIteration, List[BoundingBox]] = {}
    bounding_boxes_path = os.path.join(
        directories.arxiv_subdir("hue-locations-for-citations", arxiv_id),
        "hue_locations.csv",
    )
    if not os.path.exists(bounding_boxes_path):
        logging.warning(
            "Could not find bounding boxes information for %s. Skipping", arxiv_id,
        )
        return None
    with open(bounding_boxes_path) as bounding_boxes_file:
        reader = csv.reader(bounding_boxes_file)
        for row in reader:
            iteration = row[1]
            hue = float(row[2])
            box = BoundingBox(
                page=int(row[3]),
                left=float(row[4]),
                top=float(row[5]),
                width=float(row[6]),
                height=float(row[7]),
            )
            hue_iteration = HueIteration(hue, iteration)
            if hue_iteration not in boxes_by_hue_iteration:
                boxes_by_hue_iteration[hue_iteration] = []
            boxes_by_hue_iteration[hue_iteration].append(box)

    return boxes_by_hue_iteration


def load_equation_token_locations(
    arxiv_id: ArxivId,
) -> Optional[Dict[CharacterId, List[BoundingBox]]]:

    token_locations: Dict[CharacterId, List[BoundingBox]] = {}
    token_locations_path = os.path.join(
        directories.arxiv_subdir("hue-locations-for-equation-tokens", arxiv_id),
        "hue_locations.csv",
    )
    if not os.path.exists(token_locations_path):
        logging.warning(
            "Could not find bounding boxes information for %s. Skipping", arxiv_id,
        )
        return None
    with open(token_locations_path) as token_locations_file:
        reader = csv.reader(token_locations_file)
        for row in reader:
            tex_path = row[-3]
            equation_index = int(row[-2])
            character_index = int(row[-1])
            character_id = CharacterId(tex_path, equation_index, character_index)
            box = BoundingBox(
                page=int(row[3]),
                left=float(row[4]),
                top=float(row[5]),
                width=float(row[6]),
                height=float(row[7]),
            )
            if character_id not in token_locations:
                token_locations[character_id] = []
            token_locations[character_id].append(box)

    return token_locations
