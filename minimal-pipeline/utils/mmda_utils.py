"""



"""

from typing import List

from mmda.types.document import Document
from mmda.types.annotation import SpanGroup, Span


def tokens_to_words(tokens: List[SpanGroup]) -> List[SpanGroup]:
    words = []
    word_id = 0
    for token in tokens:
        text = token.symbols[0]
        if text != 'fraction(-)':
            token_json = token.to_json()
            word_json = {key:value for key, value in token_json.items()}
            word_json['id'] = word_id
            word_json['text'] = token.symbols[0]
            word = SpanGroup.from_json(span_group_dict=word_json)
            word.doc = token.doc
            words.append(word)
            word_id += 1
    return words


