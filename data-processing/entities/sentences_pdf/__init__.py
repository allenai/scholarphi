from common.commands.base import CommandList
from common.commands.base import CommandList
from common.commands.upload_entities import make_upload_entities_command
from entities.sentences_pdf.commands.fetch_spp_jsons import FetchSppJsons
from entities.sentences_pdf.commands.locate_sentences import LocateSentencesCommand
from scripts.pipelines import EntityPipeline, register_entity_pipeline
from entities.sentences.types import Sentence
from .upload import upload_sentences

from common import directories

commands: CommandList = []

# step 2: download spp from s3
directories.register('fetched-spp-jsons')
commands.append(FetchSppJsons)

# step 3: compute sentence bboxes via fuzzy matching
directories.register(f"sentences-locations")
commands.append(LocateSentencesCommand)

# step 4: upload
upload_command = make_upload_entities_command('sentences', upload_sentences, DetectedEntityType=Sentence)
commands.append(upload_command)

# register
sentences_pipeline = EntityPipeline("sentences-pdf", commands, depends_on=['sentences', 'equations', 'symbols'])
register_entity_pipeline(sentences_pipeline)
