"""
Utilities for reading and writing to files. Functions should be placed in here if they need to be
used by multiple scripts or modules.
"""

import ast
import csv
import dataclasses
import json
import logging
import os
import shutil
from typing import Any, Dict, Iterator, List, Optional, Type, TypeVar

from common import directories
from common.string import JournaledString
from common.types import (
    ArxivId,
    BoundingBox,
    CompilationResult,
    Equation,
    EquationId,
    FileContents,
    HueIteration,
    HueLocationInfo,
    Path,
    SerializableChild,
    SerializableSymbol,
    SerializableSymbolToken,
    SerializableToken,
    Symbol,
    SymbolId,
    SymbolWithId,
    TokenId,
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


def read_tex(arxiv_id: str) -> Dict[str, FileContents]:
    """
    Read the contents of all TeX files for this arXiv paper.
    """
    contents_by_file = {}
    sources_path = directories.arxiv_subdir("sources", arxiv_id)
    for tex_path in find_files(sources_path, [".tex"], relative=True):
        absolute_tex_path = os.path.join(
            directories.arxiv_subdir("sources", arxiv_id), tex_path
        )
        file_contents = read_file_tolerant(absolute_tex_path)
        if file_contents is not None:
            contents_by_file[tex_path] = file_contents

    return contents_by_file


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
        try:
            data_dict = dataclasses.asdict(data_obj)
        except RecursionError:
            logging.warning(  # pylint: disable=logging-not-lazy
                "Couldn't serialize data %s due to recursion error."
                + "Make sure that there are no cyclic references in data",
                data_obj,
            )
        else:
            # Because the CSV writer outputs null values as empty strings, all 'None's need to be
            # replaced with a unique string indicating the value is null, so that the string can
            # be replaced with 'None' again when the data is loaded back in.
            for k, v in data_dict.items():
                if v is None:
                    data_dict[k] = "<!NULL!>"
                if isinstance(v, JournaledString):
                    data_dict[k] = json.dumps(v.to_json())
            writer = csv.DictWriter(
                # QUOTE_NONNUMERIC is used in both the writer and the reader to ensure that numbers
                # (e.g., indexes, hues, positions) are decoded as numbers.
                csv_file,
                fieldnames=data_dict.keys(),
                quoting=csv.QUOTE_MINIMAL,
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
    headers in the CSV file must exactly match the property names of 'D'. There can, however,
    be extra columns in the CSV file that don't correspond to the dataclass.
    """
    with open(csv_path, encoding=encoding, newline="") as csv_file:
        reader = csv.DictReader(csv_file, quoting=csv.QUOTE_MINIMAL)
        for row in reader:
            data: Dict[str, Any] = {}
            # Transfer data from the row into a dictionary of arguments. By only including the
            # fields for D, we skip over columns that can't be used to initialize D. At the
            # same time, cast each column to the intended data type.
            invalid = False
            for field in dataclasses.fields(D):

                try:
                    type_ = field.type
                    is_optional = False

                    # If the field is optional, check for the special null value. If it's not
                    # present, determine which primitive type the value should be cast to. See
                    # note for List[str] for cautions about using dynamic type-checks like this
                    # for mypy types like Optional types.
                    if type_ in [
                        Optional[bool],
                        Optional[int],
                        Optional[float],
                        Optional[str],
                    ]:
                        is_optional = True
                        type_ = (
                            bool
                            if type_ == Optional[bool]
                            else int
                            if type_ == Optional[int]
                            else float
                            if type_ == Optional[float]
                            else str
                            if type_ == Optional[str]
                            else Type[Any]
                        )
                    if is_optional and row[field.name] == "<!NULL!>":
                        data[field.name] = None

                    # Journaled strings should be loaded from JSON.
                    elif type_ == JournaledString:
                        data[field.name] = JournaledString.from_json(
                            json.loads(row[field.name])
                        )
                    # Rules for reading Booleans. Support casting of '0' and '1' or the strings
                    # 'True' and 'False'. 'True' and 'False' are the default output of CSV writer.
                    elif type_ == bool:
                        data[field.name] = bool(ast.literal_eval(row[field.name]))
                    # Handle other primitive values.
                    elif type_ in [int, float, str]:
                        data[field.name] = type_(row[field.name])
                    # XXX(andrewhead): It's not guaranteed that type-checks like this one will work
                    # as the 'typing' library evolves. At the time of writing, it looked like calls
                    # to the '__eq__' method of classes that extend GenericMeta (like List, Tuple)
                    # should work (i.e., comparing a type with '=='). See:
                    # https://github.com/python/typing/blob/c85016137eab6d0784b76252460235638087f468/src/typing.py#L1093-L1098
                    # See also this test for equality in the Tuple class.
                    # https://github.com/python/typing/blob/c85016137eab6d0784b76252460235638087f468/src/test_typing.py#L400
                    # If at some point this comparison stops working, perhaps we can define a custom
                    # type for types of interest (like StrList) and compare the ID of the newly defined type.
                    elif field.type == List[str]:
                        data[field.name] = ast.literal_eval(row[field.name])
                    else:
                        logging.warning(  # pylint: disable=logging-not-lazy
                            "Could not decode data for field %s of type %s . "
                            + "This may mean that the rules for reading CSV files need to "
                            + "be extended to support this data type.",
                            field.name,
                            field.type,
                        )
                except (ValueError, json.JSONDecodeError) as e:
                    logging.warning(  # pylint: disable=logging-not-lazy
                        "Could not read value '%s' for field '%s' of expected type %s from CSV. "
                        + "Error: %s. This row will be skipped. This value probably had an "
                        + "invalid type when the data for the row was created.",
                        row[field.name],
                        field.name,
                        field.type,
                        e,
                    )
                    invalid = True

            if not invalid:
                yield D(**data)  # type: ignore


def clean_directory(directory: str) -> None:
    " Remove all files and subdirectories from a directory; leave the directory. "
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


def delete_data(arxiv_id: ArxivId) -> None:
    """
    Remove all data produced in the data directories when processing an arXiv ID. Note that this
    will remove data from data directories that have been registered using
    'directories.register'. If the set of keys for directories change, or the order they are
    registered changes, it may appear that some data for the paper has not been deleted.
    """

    logging.debug("Removing data files for paper %s", arxiv_id)

    for dirkey in directories.dirkeys():
        arxiv_data_path = directories.arxiv_subdir(dirkey, arxiv_id)
        if os.path.exists(arxiv_data_path):
            if os.path.isfile(arxiv_data_path):
                os.unlink(arxiv_data_path)
                logging.debug(
                    "Removed data file %s for paper %s", arxiv_data_path, arxiv_id
                )
            elif os.path.isdir(arxiv_data_path):
                shutil.rmtree(arxiv_data_path)
                logging.debug(
                    "Removed data directory %s for paper %s", arxiv_data_path, arxiv_id,
                )


def find_files(
    dir_: str, extensions: List[str], relative: bool = False
) -> Iterator[str]:
    " Find all files in a directory with a given extension. "
    for (dirpath, _, filenames) in os.walk(dir_):
        for filename in filenames:
            __, ext = os.path.splitext(filename)
            if ext in extensions:
                path = os.path.join(dirpath, filename)
                if relative:
                    path = os.path.relpath(path, os.path.abspath(dir_))
                yield path


def load_equations(arxiv_id: ArxivId) -> Optional[Dict[EquationId, Equation]]:
    equations_path = os.path.join(
        directories.arxiv_subdir("detected-equations", arxiv_id), "entities.csv"
    )
    if not os.path.exists(equations_path):
        logging.warning("No equation data found for paper %s. Skipping.", arxiv_id)
        return None

    equations: Dict[EquationId, Equation] = {}
    for e in load_from_csv(equations_path, Equation):
        equation_id = EquationId(tex_path=e.tex_path, equation_index=int(e.i))
        equations[equation_id] = e
    return equations


def load_tokens(arxiv_id: ArxivId) -> Optional[List[SerializableToken]]:
    tokens_path = os.path.join(
        directories.arxiv_subdir("detected-equation-tokens", arxiv_id), "entities.csv"
    )
    if not os.path.exists(tokens_path):
        logging.warning(
            "No equation token data found for paper %s. Skipping.", arxiv_id
        )
        return None

    return list(load_from_csv(tokens_path, SerializableToken))


def load_symbols(arxiv_id: ArxivId) -> Optional[List[SymbolWithId]]:

    data_dir = directories.arxiv_subdir("detected-equation-tokens", arxiv_id)
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
        logging.info("No symbol children data found for paper %s.", arxiv_id)
        file_not_found = True

    if file_not_found:
        return None

    loaded_symbols = load_from_csv(symbols_path, SerializableSymbol)
    loaded_symbol_tokens = load_from_csv(symbol_tokens_path, SerializableSymbolToken)
    loaded_symbol_children = load_from_csv(symbol_children_path, SerializableChild)

    symbols_by_id: Dict[SymbolId, Symbol] = {}
    for s in loaded_symbols:
        symbol_id = SymbolId(s.tex_path, s.equation_index, s.symbol_index)
        symbols_by_id[symbol_id] = Symbol(
            tokens=[], start=s.start, end=s.end, tex=s.tex, mathml=s.mathml, children=[]
        )

    for t in loaded_symbol_tokens:
        symbol_id = SymbolId(t.tex_path, t.equation_index, t.symbol_index)
        symbols_by_id[symbol_id].tokens.append(t.token_index)

    for c in loaded_symbol_children:
        parent_id = SymbolId(c.tex_path, c.equation_index, c.symbol_index)
        child_id = SymbolId(c.tex_path, c.equation_index, c.child_index)
        try:
            child_symbol = symbols_by_id[child_id]
            symbols_by_id[parent_id].children.append(child_symbol)
        except KeyError:
            logging.warning(  # pylint: disable=logging-not-lazy
                "Could not load child symbol %s for symbol %s for paper %s. "
                + "There may have been an error in the equation parser, like a failure to "
                + "find tokens for the child symbol.",
                child_id,
                parent_id,
                arxiv_id,
            )

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

    output_files_path = os.path.join(results_dir, "output_files.csv")
    for output_file in result.output_files:
        append_to_csv(output_files_path, output_file)

    with open(os.path.join(results_dir, "stdout.log"), "wb") as stdout_file:
        stdout_file.write(result.stdout)

    with open(os.path.join(results_dir, "stderr.log"), "wb") as stderr_file:
        stderr_file.write(result.stderr)


def load_hue_locations(
    arxiv_id: ArxivId, entity_name: str
) -> Optional[Dict[HueIteration, List[BoundingBox]]]:
    """
    Load bounding boxes for each entity. Entities are indexes by the hue they were colored and
    the iteraction of coloring in which they were assigned that hue. Entities can have multiple
    bounding boxes (e.g., if they are split over multiple lines).
    """

    boxes_by_hue_iteration: Dict[HueIteration, List[BoundingBox]] = {}
    bounding_boxes_path = os.path.join(
        directories.arxiv_subdir(f"hue-locations-for-{entity_name}", arxiv_id),
        "hue_locations.csv",
    )
    if not os.path.exists(bounding_boxes_path):
        logging.warning(
            "Could not find bounding boxes information entity of type %s for paper %s. Skipping.",
            entity_name,
            arxiv_id,
        )
        return None

    for hue_info in load_from_csv(bounding_boxes_path, HueLocationInfo):
        box = BoundingBox(
            page=hue_info.page,
            left=hue_info.left,
            top=hue_info.top,
            width=hue_info.width,
            height=hue_info.height,
        )
        hue_iteration = HueIteration(hue_info.hue, hue_info.iteration)
        if hue_iteration not in boxes_by_hue_iteration:
            boxes_by_hue_iteration[hue_iteration] = []
        boxes_by_hue_iteration[hue_iteration].append(box)

    return boxes_by_hue_iteration


def load_citation_hue_locations(
    arxiv_id: ArxivId,
) -> Optional[Dict[HueIteration, List[BoundingBox]]]:
    return load_hue_locations(arxiv_id, "citations")


def load_equation_token_locations(
    arxiv_id: ArxivId,
) -> Optional[Dict[TokenId, List[BoundingBox]]]:

    token_locations: Dict[TokenId, List[BoundingBox]] = {}
    token_locations_path = os.path.join(
        directories.arxiv_subdir("hue-locations-for-equation-tokens", arxiv_id),
        "hue_locations.csv",
    )
    if not os.path.exists(token_locations_path):
        logging.warning(
            "Could not find bounding boxes information for %s. Skipping", arxiv_id,
        )
        return None

    for record in load_from_csv(token_locations_path, HueLocationInfo):
        equation_index, token_index = [int(t) for t in record.entity_id.split("-")]
        token_id = TokenId(record.tex_path, equation_index, token_index)
        box = BoundingBox(
            page=int(record.page),
            left=record.left,
            top=record.top,
            width=record.width,
            height=record.height,
        )
        if token_id not in token_locations:
            token_locations[token_id] = []
        token_locations[token_id].append(box)

    return token_locations
