from dataclasses import dataclass

from common.types import SerializableEntity


@dataclass(frozen=True)
class Abbreviation(SerializableEntity):
    text: str
    expansion : str
    # The str_id tells us whether it is a full form or short form (f or s),
    # which abbreviation it is (e.g. NLP might be 1 and GPU might be 2),
    # and which instance of the abbreviation it is (i.e. 1 for the first instance, 2 for the second, and so on).
    str_id : str
