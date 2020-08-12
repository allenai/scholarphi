import logging
import os.path
from argparse import ArgumentParser
from collections import defaultdict
from dataclasses import dataclass
from typing import Any, Dict, Iterator, List, Union, cast

from tqdm import tqdm

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.parse_tex import PhraseExtractor, get_containing_entity, overlaps
from common.types import ArxivId, CharacterRange, FileContents, SerializableEntity

from ..nlp import DefinitionDetectionModel
from ..types import Definiendum, Definition, EmbellishedSentence, TermReference

"""
Deployment TODOs:
* TODO(dykang): add dependencies to Dockerfile
* TODO(dykang): document model download instructions in README
* TODO(dykang): make model location configurable in config.ini

Detection improvement TODOs:
* TODO(dykang): aggregation over terms / definitions (e.g., coreference links)
* TODO(dykang): add confidence scores
* TODO(dykang): classify definitions and terms into types
"""

TermName = str
DefinitionId = str


@dataclass(frozen=True)
class DetectDefinitionsTask:
    arxiv_id: ArxivId
    sentences: List[EmbellishedSentence]
    tex_by_file: Dict[str, FileContents]


@dataclass(frozen=True)
class TermDefinitionPair:
    term_start: int
    term_end: int
    term_text: str
    definition_start: int
    definition_end: int
    definition_text: str


def get_token_character_ranges(text: str, tokens: List[str]) -> List[CharacterRange]:
    """
    Extract start and end charcter positions for each token in featurized tokens
    """
    ranges = []
    current_position = 0
    for token in tokens:
        start_index = text[current_position:].index(token)
        ranges.append(
            CharacterRange(
                current_position + start_index,
                current_position + start_index + len(token) - 1,
            )
        )
        current_position += len(token)
    return ranges


def get_term_definition_pairs(
    text: str, featurized_text: Dict[Any, Any], slot_preds: List[str],
) -> List[TermDefinitionPair]:

    # Make index from tokens to their character positions.
    ranges = get_token_character_ranges(text, featurized_text["tokens"])

    # Extract ranges for all terms and definitions.
    terms: List[List[CharacterRange]] = []
    definitions: List[List[CharacterRange]] = []
    term_ranges, definition_ranges = [], []

    for (slot_label, r) in zip(slot_preds, ranges):
        if slot_label == "TERM":
            term_ranges.append(r)
        if slot_label == "DEF":
            definition_ranges.append(r)
        if slot_label == "O":
            if len(term_ranges) > 0:
                terms.append(term_ranges)
            if len(definition_ranges) > 0:
                definitions.append(definition_ranges)
            term_ranges, definition_ranges = [], []

    # Match pairs of term and definitions sequentially ( O T O O D then (T, D)). This
    # does not handle multi-term / definitions pairs
    num_term_definition_pairs = min(len(terms), len(definitions))
    pairs: List[TermDefinitionPair] = []
    for pair_index in range(num_term_definition_pairs):
        logging.debug(
            "Found slot predictions for tokens: (tokens: %s), (slots: %s)",
            featurized_text["tokens"],
            slot_preds,
        )
        logging.debug(
            "Processing term-definition pair %d of %d",
            pair_index,
            num_term_definition_pairs,
        )

        term_range_list = terms[pair_index]
        definition_range_list = definitions[pair_index]

        term_start = min([r.start for r in term_range_list])
        term_end = max([r.end for r in term_range_list]) + 1
        definition_start = min([r.start for r in definition_range_list])
        definition_end = max([r.end for r in definition_range_list]) + 1

        pair = TermDefinitionPair(
            term_start=term_start,
            term_end=term_end,
            term_text=text[term_start:term_end],
            definition_start=definition_start,
            definition_end=definition_end,
            definition_text=text[definition_start:definition_end],
        )
        logging.debug("Found definition-term pair %s", pair)
        pairs.append(pair)

    return pairs


class DetectDefinitions(
    ArxivBatchCommand[
        DetectDefinitionsTask, Union[Definiendum, Definition, TermReference]
    ]
):
    """
    Extract terms and definitions of those terms from sentences using a pre-trained definition
    extraction model. Performs the following stpes:
    1. Load cleaned sentences from the 'detected-sentences' data directory
    2. Extract features from each sentence (aka featurization)
    3. Load the pre-trained NLP model, load the features, and predict intent and term:definition
       slots. The model predicts intents and slots:
        * Intent: whether a sentence is detected as including a definition or not
        * Slot: a tag for each token indicating it is one of (TERM, DEFINITION, neither)
    4. Find all references to terms in the text
    5. Save detected terms to 'entities-terms.csv' and detected definitions to
       'entities-definitions.csv'
    """

    @staticmethod
    def get_name() -> str:
        return "detect-definitions"

    @staticmethod
    def get_description() -> str:
        return "Extract term and definition pairs from LaTeX."

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(DetectDefinitions, DetectDefinitions).init_parser(parser)
        parser.add_argument(
            "--show-progress",
            action="store_true",
            help=(
                "Whether to show progress bar during definition extraction. "
                + "Interferes with log messages shown on the command line."
            ),
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=8,
            help=("Number of sentences to process at a time to detect definitions."),
        )

    def get_arxiv_ids_dirkey(self) -> str:
        return "detected-sentences"

    def load(self) -> Iterator[DetectDefinitionsTask]:
        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("detected-definitions", arxiv_id)
            file_utils.clean_directory(output_dir)

            # Load cleaned sentences for definition detection.
            detected_sentences_path = os.path.join(
                directories.arxiv_subdir("embellished-sentences", arxiv_id),
                "sentences.csv",
            )
            try:
                sentences = list(
                    file_utils.load_from_csv(
                        detected_sentences_path, EmbellishedSentence
                    )
                )
            except FileNotFoundError:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No sentences data found for arXiv paper %s. Try re-running the pipeline, "
                    + "this time enabling the processing of sentences. If that doesn't work, "
                    + "there is likely an error in detected sentences for this paper.",
                    arxiv_id,
                )
                continue

            # Read in all TeX. Once definition detection is finished, all the TeX will be searched
            # for references to the defined terms.
            tex_by_file = file_utils.read_tex(arxiv_id)

            yield DetectDefinitionsTask(arxiv_id, sentences, tex_by_file)

    def process(
        self, item: DetectDefinitionsTask
    ) -> Iterator[Union[Definiendum, Definition, TermReference]]:
        sentences_ordered = sorted(item.sentences, key=lambda s: s.start)
        num_sentences = len(sentences_ordered)

        if len(item.sentences) == 0:
            logging.warning(  # pylint: disable=logging-not-lazy
                "No sentences found for arXiv ID %s. Skipping detection of sentences "
                + "that contain entities.",
                item.arxiv_id,
            )
            return

        # Load the pre-trained definition detection model.
        model = DefinitionDetectionModel()

        definition_index = 0
        features = []
        sentences = []

        definiendums: Dict[TermName, List[Definiendum]] = defaultdict(list)
        definitions: Dict[DefinitionId, Definition] = {}

        with tqdm(
            total=num_sentences, disable=(not self.args.show_progress)
        ) as progress:

            for si, sentence in enumerate(sentences_ordered):
                progress.update(1)

                # Extract features from raw text.
                featurized_text = model.featurize(sentence.legacy_definition_input)
                features.append(featurized_text)
                sentences.append(sentence)

                # Process sentences in batches.
                if len(features) >= self.args.batch_size or si == num_sentences - 1:

                    # Detect terms and definitions in each sentence with a pre-trained definition
                    # extraction model, from the featurized text.
                    intents, slots = model.predict_batch(
                        cast(List[Dict[Any, Any]], features)
                    )

                    for s, sentence_features, intent, sentence_slots in zip(
                        sentences, features, intents, slots
                    ):
                        # Only process slots when they includ both 'TERM' and 'DEFINITION'.
                        if "TERM" not in sentence_slots or "DEF" not in sentence_slots:
                            continue

                        pairs = get_term_definition_pairs(
                            s.legacy_definition_input,
                            sentence_features,
                            sentence_slots,
                        )
                        for pair in pairs:

                            tex_path = s.tex_path
                            definiendum_id = (
                                f"definiendum-{tex_path}-{definition_index}"
                            )
                            definition_id = f"definition-{tex_path}-{definition_index}"
                            definiendum_text = pair.term_text

                            # Map definiendum and definition start and end positions back to
                            # their original positions in the TeX.
                            offsets = s.legacy_definition_input_journal.initial_offsets(
                                pair.term_start, pair.term_end
                            )
                            if offsets[0] is None or offsets[1] is None:
                                logging.warning(  # pylint: disable=logging-not-lazy
                                    "Could not find offsets of definiendum %s in original TeX "
                                    + "(from sentence %s, file %s, arXiv ID %s). Definiendum will not be saved.",
                                    pair.term_text,
                                    s.id_,
                                    s.tex_path,
                                    item.arxiv_id,
                                )
                                continue
                            definiendum_start = s.start + offsets[0]
                            definiendum_end = s.start + offsets[1]

                            offsets = s.legacy_definition_input_journal.initial_offsets(
                                pair.definition_start, pair.definition_end
                            )
                            if offsets[0] is None or offsets[1] is None:
                                logging.warning(  # pylint: disable=logging-not-lazy
                                    "Could not find offsets of definition %s in original TeX "
                                    + "(from sentence %s, file %s, arXiv ID %s). Definiendum will not be saved.",
                                    pair.definition_text,
                                    s.id_,
                                    s.tex_path,
                                    item.arxiv_id,
                                )
                                continue
                            definition_start = s.start + offsets[0]
                            definition_end = s.start + offsets[1]

                            try:
                                tex = item.tex_by_file[tex_path]
                            except KeyError:
                                logging.warning(  # pylint: disable=logging-not-lazy
                                    "Could not find TeX for %s. TeX will not be included in "
                                    + "the output data for definition '%s' for term '%s'",
                                    tex_path,
                                    pair.definition_text,
                                    definiendum_text,
                                )
                                definiendum_tex = "NOT AVAILABLE"
                                definition_tex = "NOT AVAILABLE"
                            else:
                                definiendum_tex = tex.contents[
                                    definiendum_start:definiendum_end
                                ]
                                definition_tex = tex.contents[
                                    definition_start:definition_end
                                ]

                            # Save the definition to file.
                            definition = Definition(
                                id_=definition_id,
                                start=definition_start,
                                end=definition_end,
                                definiendum=definiendum_text,
                                type_=None,
                                tex_path=tex_path,
                                tex=definition_tex,
                                text=pair.definition_text,
                                context_tex=s.context_tex,
                                sentence_id=s.id_,
                                intent=bool(intent),
                                confidence=None,
                            )
                            definitions[definition_id] = definition
                            yield definition

                            # Don't save the definiendum to file yet. Save it in memory first, and then
                            # save it to file once it's done being processed. It will need
                            # to be associated with other definitions. Also, other references
                            # to the term will be detected before this method is over.
                            definiendums[definiendum_text].append(
                                Definiendum(
                                    id_=definiendum_id,
                                    text=definiendum_text,
                                    type_=None,
                                    confidence=None,
                                    # Link the definiendum to the text that defined it.
                                    definition_id=definition_id,
                                    # Because a term can be defined multiple places in the paper, these
                                    # three lists of definition data will be filled out once all of the
                                    # definitions have been found.
                                    definition_ids=[],
                                    definitions=[],
                                    sources=[],
                                    start=definiendum_start,
                                    end=definiendum_end,
                                    tex_path=tex_path,
                                    tex=definiendum_tex,
                                    context_tex=s.context_tex,
                                    sentence_id=s.id_,
                                )
                            )
                            definition_index += 1

                    features = []
                    sentences = []

        logging.debug(
            "Finished detecting definitions for paper %s. Now finding references to defined terms.",
            item.arxiv_id,
        )

        all_definiendums: List[Definiendum] = []
        for _, definiendum_list in definiendums.items():
            all_definiendums.extend(definiendum_list)
        term_phrases: List[TermName] = list(definiendums.keys())
        definition_ids: Dict[TermName, List[DefinitionId]] = {}
        definition_texts: Dict[TermName, List[str]] = {}
        sources: Dict[TermName, List[str]] = {}

        # Associate terms with all definitions that apply to them.
        for term, definiendum_list in definiendums.items():
            definition_ids[term] = [d.definition_id for d in definiendum_list]
            definition_texts[term] = [
                definitions[d.definition_id].text for d in definiendum_list
            ]
            sources[term] = ["model"] * len(definition_ids[term])

        # Associate each definiendum with all applicable definitions, and save them to file.
        for _, definiendum_list in definiendums.items():
            for d in definiendum_list:
                d.definition_ids.extend(definition_ids[d.text])
                d.definitions.extend(definition_texts[d.text])
                d.sources.extend(sources[d.text])
                yield d

        # Detect all other references to the defined terms.
        term_index = 0
        sentence_entities: List[SerializableEntity] = cast(
            List[SerializableEntity], item.sentences
        )

        for tex_path, file_contents in item.tex_by_file.items():
            term_extractor = PhraseExtractor(term_phrases)
            for t in term_extractor.parse(tex_path, file_contents.contents):
                t_sentence = get_containing_entity(t, sentence_entities)

                # Don't save term references if they are already in the definiendums
                if any([overlaps(d, t) for d in all_definiendums]):
                    continue

                logging.debug(
                    "Found reference to term %s at (%d, %d) in %s for arXiv ID %s",
                    t.text,
                    t.start,
                    t.end,
                    t.tex_path,
                    item.arxiv_id,
                )
                yield TermReference(
                    id_=f"term-{t.tex_path}-{term_index}",
                    text=t.text,
                    type_=None,
                    definition_ids=definition_ids[t.text],
                    definitions=definition_texts[t.text],
                    sources=sources[t.text],
                    start=t.start,
                    end=t.end,
                    tex_path=t.tex_path,
                    tex=t.tex,
                    context_tex=t.context_tex,
                    sentence_id=t_sentence.id_ if t_sentence is not None else None,
                )
                term_index += 1

    def save(
        self,
        item: DetectDefinitionsTask,
        result: Union[Definiendum, Definition, TermReference],
    ) -> None:

        output_dir = directories.arxiv_subdir("detected-definitions", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        definiendums_path = os.path.join(output_dir, "entities-definiendums.csv")
        definitions_path = os.path.join(output_dir, "entities-definitions.csv")
        term_references_path = os.path.join(output_dir, "entities-term-references.csv")

        if isinstance(result, Definiendum):
            file_utils.append_to_csv(definiendums_path, result)
        elif isinstance(result, Definition):
            file_utils.append_to_csv(definitions_path, result)
        elif isinstance(result, TermReference):
            file_utils.append_to_csv(term_references_path, result)
