import dataclasses
from dataclasses import dataclass
import logging
from typing import Any, Dict, Optional, Tuple


@dataclass
class Segment:
    initial: str
    current: str
    changed: bool


class MutableString:
    """
    A string that can be transformed by replacing spans in that string. It preserves a record
    of which spans have been replaced, supporting the mapping of character offsets in the
    mutated version of the string to character offsets in the original string. This class was
    created to help with finding locations in a string of TeX corresponding to entities that
    were found in a transformed version of that TeX.
    """

    def __init__(self, string: str) -> None:
        self.segments = [Segment(string, string, False)]

    def __str__(self) -> str:
        return "".join([s.current for s in self.segments])

    @property
    def initial_value(self) -> str:
        return "".join([s.initial for s in self.segments])

    def replace(self, start: int, end: int, string: str) -> str:
        " Replace a substring of the string (from 'start' to 'end') with a new substring. "

        new_segments = []
        s_start = 0
        replacement_inserted = False

        for s in self.segments:

            s_end = s_start + len(s.current)
            if not (start <= s_end and end >= s_start):
                new_segments.append(s)
                s_start += len(s.current)
                continue

            start_in_s = min(max(0, start - s_start), len(s.current))
            end_in_s = min(max(0, end - s_start), len(s.current))

            # Split the initial value of the segment into sub-segments. If the
            # segment hasn't been changed yet, divide it at the 'start' and 'end' boundaries.
            if not s.changed:
                initial_split = [
                    s.initial[:start_in_s],
                    s.initial[start_in_s:end_in_s],
                    s.initial[end_in_s:],
                ]
            # If the segment has been changed by a past call to 'replace', then assign
            # 'initial' to the first split segment. While not semantically correct, it will
            # work out: these segments will be recombined into one at the end of this method.
            else:
                initial_split = [s.initial, "", ""]

            # Split the current value of the segment into sub-segments.
            current_split = [
                s.current[:start_in_s],
                # Insert the updated string in the first segment where the replacement
                # span overlaps. Other overlapping segments will be cleared out, and then
                # merged into this one in a later step.
                string if not replacement_inserted else "",
                s.current[end_in_s:],
            ]
            replacement_inserted = True

            # Save a new list of segments comprised of the sub-segments.
            new_segments.extend(
                [
                    Segment(initial_split[0], current_split[0], s.changed),
                    Segment(initial_split[1], current_split[1], True),
                    Segment(initial_split[2], current_split[2], s.changed),
                ]
            )

            s_start += len(s.current)

        # Merge consecutive "changed" ranges, assigning them into all one value of
        # 'initial' and 'current' by concatenating them all together.
        merged = []
        last_segment: Optional[Segment] = None
        for s in new_segments:
            # Skip blank sub-segments.
            if len(s.current) == 0 and len(s.initial) == 0:
                continue
            # Merge consecutive ranges that are either changed or not.
            if last_segment is not None and s.changed == last_segment.changed:
                last_segment.initial += s.initial
                last_segment.current += s.current
            else:
                merged.append(s)
                last_segment = s

        self.segments = merged
        return str(self)

    def to_initial_offsets(
        self, start: int, end: int
    ) -> Tuple[Optional[int], Optional[int]]:
        """
        Convert offsets expressed relative to the current value of the string to offsets in the
        original string. The offsets will be precise wherever the string hasn't been changed. They
        will be approximate returning a conservatively large span in places where the string has
        been mutated.
        """

        current_segment_start = 0
        initial_segment_start = 0

        start_in_initial: Optional[int] = None
        for s in self.segments:

            current_segment_end = current_segment_start + len(s.current)

            # Search the segment for the start position.
            if start_in_initial is None:
                if current_segment_start <= start <= current_segment_end:
                    start_in_initial = initial_segment_start
                    # If the 'start' offset comes at the end of this segment, return the end.
                    if s.changed and start == current_segment_end:
                        start_in_initial = initial_segment_start + len(s.initial)
                    # If this segment is still from the initial string, the start index
                    # can be adjusted to a specific offset in the segment.
                    if not s.changed:
                        start_in_initial += start - current_segment_start

            # Only look for the end once the start has been found.
            if start_in_initial is not None:
                # Search the segment for the end position. This search process is analogous
                # to the search for 'start' above; see it for comments.
                if current_segment_start <= end <= current_segment_end:
                    if s.changed:
                        if end == current_segment_start:
                            end_in_initial = initial_segment_start
                        else:
                            end_in_initial = initial_segment_start + len(s.initial)
                    else:
                        end_in_initial = initial_segment_start + (
                            end - current_segment_start
                        )
                    return (start_in_initial, end_in_initial)

            current_segment_start += len(s.current)
            initial_segment_start += len(s.initial)

        return (None, None)

    def from_initial_offsets(self, start: int, end: int) -> Tuple[int, int]:
        """
        Convert offsets expressed relative to the initial value of the string to offsets in the
        updated (current value of the) string. See the note in 'to_initial_offsets' about the
        limitations of precision in this method.
        """

        current_segment_start = 0
        initial_segment_start = 0

        start_in_current: Optional[int] = None
        for s in self.segments:

            initial_segment_end = initial_segment_start + len(s.initial)

            # Search the segment for the start position.
            if start_in_current is None:
                if initial_segment_start <= start <= initial_segment_end:
                    start_in_current = current_segment_start
                    # If the 'start' offset comes at the end of this segment, return the end.
                    if s.changed and start == initial_segment_end:
                        start_in_current = current_segment_start + len(s.current)
                    # If this segment is still from the initial string, the start index
                    # can be adjusted to a specific offset in the segment.
                    if not s.changed:
                        start_in_current += start - initial_segment_start

            # Only look for the end once the start has been found.
            if start_in_current is not None:
                # Search the segment for the end position. This search process is analogous
                # to the search for 'start' above; see it for comments.
                if initial_segment_start <= end <= initial_segment_end:
                    if s.changed:
                        if end == initial_segment_start:
                            end_in_current = current_segment_start
                        else:
                            end_in_current = current_segment_start + len(s.current)
                    else:
                        end_in_current = current_segment_start + (
                            end - initial_segment_start
                        )
                    return (start_in_current, end_in_current)

            current_segment_start += len(s.current)
            initial_segment_start += len(s.initial)

        return (None, None)


    def to_json(self) -> Dict[str, Any]:
        return {
            "value": str(self),
            "segments": ([dataclasses.asdict(s) for s in self.segments]),
        }

    @staticmethod
    def from_json(json: Dict[str, Any]) -> "MutableString":
        try:
            string = MutableString("invalid")
            string.segments = [
                Segment(str(s["initial"]), str(s["current"]), bool(s["changed"]))
                for s in json["segments"]
            ]
            return string
        except (KeyError, TypeError) as e:
            raise ValueError(
                f"Could not instantiate MutableString from JSON {json}. Error: {e}"
            )
