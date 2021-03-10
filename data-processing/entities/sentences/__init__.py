from common.types import ColorizeOptions
from common.commands.base import Command, CommandList
from common import directories
from entities.common import create_entity_localization_command_sequence
from common.commands.detect_entities import make_detect_entities_command
from common.commands.upload_entities import make_upload_entities_command
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .colorize import adjust_color_positions
from .extractor import SentenceExtractor
from .types import Sentence
from .upload import upload_sentences



# kyle -- remove this
# commands = create_entity_localization_command_sequence(
#     "sentences",
#     SentenceExtractor,
#     DetectedEntityType=Sentence,
#     colorize_options=ColorizeOptions(adjust_color_positions=adjust_color_positions),
#     upload_func=upload_sentences,
# )


# TODO -- manually create steps 1 & 3 instead of using this

commands: CommandList = []

# step 1: detect sentences in latex
directories.register(f"detected-sentences")
commands.append(make_detect_entities_command('sentences', SentenceExtractor))

# step 2: download spp from s3
directories.register('fetched-spp-jsons')
# TODO: missing command

# step 3: compute sentence bboxes via fuzzy matching
directories.register(f"sentences-locations")
# TODO: missing command

# step 4: upload
upload_command = make_upload_entities_command('sentences', upload_sentences, DetectedEntityType=Sentence)
commands.append(upload_command)

# register
sentences_pipeline = EntityPipeline("sentences", commands)
register_entity_pipeline(sentences_pipeline)
