from peewee import CompositeKey, ForeignKeyField, IntegerField, TextField

from common.models import OutputModel, Paper
from entities.sentences.upload import Sentence


class MathMl(OutputModel):
    mathml = TextField(unique=True, index=True)


class MathMlMatch(OutputModel):
    " A search result for a MathML equation for a paper. "

    paper = ForeignKeyField(Paper, on_delete="CASCADE")
    mathml = ForeignKeyField(MathMl, on_delete="CASCADE")
    match = ForeignKeyField(MathMl, on_delete="CASCADE")
    rank = IntegerField(index=True)


class Symbol(OutputModel):
    paper = ForeignKeyField(Paper, on_delete="CASCADE")
    mathml = ForeignKeyField(MathMl, on_delete="CASCADE")


class SymbolChild(OutputModel):
    """
    Some symbols are parents of other symbols. This has implications for interaction (i.e.
    a user may want to double click a child symbol to select the parent.) Any symbol will have
    a maximum of one parent.
    """

    parent = ForeignKeyField(Symbol, on_delete="CASCADE")
    child = ForeignKeyField(Symbol, on_delete="CASCADE")

    class Meta:
        primary_key = CompositeKey("parent", "child")


class SymbolSentence(OutputModel):
    """
    A link between a symbol and the sentence it appears in. There should be only one sentence
    for each symbol.
    """

    symbol = ForeignKeyField(Symbol, on_delete="CASCADE")
    sentence = ForeignKeyField(Sentence, on_delete="CASCADE")

    class Meta:
        primary_key = CompositeKey("symbol", "sentence")
