from common.commands.base import CommandList
from common.commands.detect_entities import make_detect_entities_command
from common.commands.upload_entities import make_upload_entities_command
from common.commands.fetch_arxiv_pdf import FetchArxivPdf
from entities.sentences_pdf.commands.locate_sentences import LocateSentencesCommand
from entities.sentences_pdf.upload import upload_sentences
from scripts.pipelines import EntityPipeline, register_entity_pipeline
from .colorize import adjust_color_positions
from .extractor import SentenceExtractor
from .types import Sentence

from common import directories

commands: CommandList = [FetchArxivPdf]

# step 1: detect sentences in latex
directories.register(f"detected-sentences")
commands.append(make_detect_entities_command('sentences', SentenceExtractor))

# register
sentences_pipeline = EntityPipeline("sentences", commands)
register_entity_pipeline(sentences_pipeline)
