"""



"""

from typing import List

from mmda.types.document import Document
from mmda.types.annotation import SpanGroup, Span

import pysbd

Segmenter = pysbd.Segmenter(language="en", clean=False, char_span=True)


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


def words_to_sents(words: List[SpanGroup]) -> List[SpanGroup]:
    # sent split
    text = " ".join([word.text for word in words])
    segments = Segmenter.segment(text=text)
    sent_start_ends = [(segment.start, segment.end) for segment in segments]

    for start, end in sent_start_ends:
        print(text[start:end])

    # make spangroups
    sents = []
    sent_id = 0
    for word in words:

    return sents


