import dataclasses
import logging
from collections import UserString
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple, Union


@dataclass
class Segment:
    initial: str
    current: str
    changed: bool


class JournaledString(UserString):  # pylint: disable=too-many-ancestors
    """
    A string that keeps a record of the edits made to it. It preserves a record
    of which spans have been replaced. This allows the mapping of character offsets in a
    changed copy of the string to character offsets in the original string. This class was
    created to help with finding locations in a string of TeX corresponding to entities that
    were found in a transformed version of that TeX.

    By subclassing 'UserString', the typical methods of a string (e.g., 'split', 'lower',
    equality comparisons, etc.) are all exposed to the client, who can use this as if it was
    a typical Python string. When the client want to make changes to this string that
    are tracked by the string, they should use the special methods defined on this class
    (e.g., "edit"). Like Python strings, this one is also immutable (i.e., the special
    methods return copies of the string, not the original string).
    """

    def __init__(self, data: Union[str, List[Segment]]) -> None:

        if isinstance(data, str):
            self.segments = [Segment(data, data, False)]
            """
            Segments of the mutable string, each of which includes information about its initial
            value, its current value, and marker indicating whether the segment has changed.
            """
        elif isinstance(data, list) and all([isinstance(s, Segment) for s in data]):
            self.segments = data
        else:
            logging.warning(  # pylint: disable=logging-not-lazy
                "Could not create JournaledString from input data %s. "
                + "Check that the input data has one of the supported types.",
                data,
            )

        # Set the initial internal contents of the UserString superclass to empty;
        # the string value will be computed dynamically from the segments (see below).
        super(JournaledString, JournaledString).__init__(self, "")

    @property  # type: ignore
    def data(self) -> str:  # type: ignore
        # 'UserString''s underlying representation of the string is in the 'data' attribute.
        # To avoid having two sources of truth for the value of the string, the 'data'
        # attribute is overwritten, so that the value of 'data' is always dynamically determined
        # from the contents of the 'segments'.
        return "".join([s.current for s in self.segments])

    @data.setter
    def data(self, _: Any) -> None:
        # This method prevents other methods in UserString from accidentally changing the
        # data of the string in an unexpected way.
        return

    @property
    def initial(self) -> str:
        " Get the initial value of the string, before it was mutated. "
        return "".join([s.initial for s in self.segments])

    def edit(self, start: int, end: int, replacement: str) -> "JournaledString":
        """
        Replace a substring of the string (from 'start' to 'end') with a new substring.
        Return a changed copy (do not modify this object).
        """

        # By making 'middle' a greedy substring, and the other two non-greedy, 'greedy'
        # absorbs the contents of 'initial' there would be a conflict, and also absorbs
        # segments where 'initial' was replaced with the empty string.
        left = self.substring(
            0,
            start,
            greedy=False,
            include_truncated_left=True,
            include_truncated_right=False,
        )
        middle = self.substring(start, end, greedy=True)
        right = self.substring(
            end,
            len(self),
            greedy=False,
            include_truncated_left=False,
            include_truncated_right=True,
        )

        # If the replacement doesn't change the string, return a clone.
        if str(middle) == replacement:
            return JournaledString(self.segments)

        # Merge the middle segments into a contiguous "changed" segment.
        merged_middle = Segment(
            initial="".join([s.initial for s in middle.segments]),
            current=replacement,
            changed=True,
        )

        # Detect whether the replacement bisects segments on its left or right side.
        left_cut = False
        right_cut = False
        s_start = 0
        for s in self.segments:
            if s_start < start < s_start + len(s.current):
                left_cut = True
            if s_start < end < s_start + len(s.current):
                right_cut = True
            s_start += len(s.current)

        # If a segment on the left was bisected, and it has been changed
        # in the past, it needs to be merged with the middle as the call to
        # 'substring' will have duplicated the 'initial' property in both the middle
        # substring and the one on the side, which needs to be deduplicated.
        if left_cut and left.segments[-1].changed:
            last_left = left.segments[-1]
            merged_middle.current = last_left.current + merged_middle.current
            del left.segments[-1]

        # Do the same check on the right.
        if right_cut and right.segments[0].changed:
            first_right = right.segments[0]
            merged_middle.current = merged_middle.current + first_right.current
            del right.segments[0]

        # Create a new string by combining all the segments.
        new_segments = []
        for segment_list in [left.segments, [merged_middle], right.segments]:
            for s in segment_list:
                if not (s.initial == "" and s.current == ""):
                    new_segments.append(s)
        return JournaledString(new_segments)

    def substring(
        self,
        start: int,
        end: int,
        greedy: bool = True,
        include_truncated_left: bool = True,
        include_truncated_right: bool = True,
    ) -> "JournaledString":
        """
        Get a substring of the journaled string, with pointers back to only the parts of the
        initial substring that correspond to the substringed part of the string. 'greedy'
        determines whether 'initial' is grown, to include:
        * segments on the boundary where 'initial' was replaced with ''
        * the contents of 'initial' for bisected segments.
        """

        new_segments: List[Segment] = []
        s_start = 0
        for s in self.segments:

            s_end = s_start + len(s.current)

            # Simplest case: 'start' and 'end' surround a segment, so that entire segment
            # will be included in the new string.
            if start <= s_start and end >= s_end:
                # Only include replacements of spans with blanks if in 'greedy' mode.
                if s_start == start and s_start == s_end and not include_truncated_left:
                    continue
                if s_end == end and s_start == s_end and not include_truncated_right:
                    continue
                new_segments.append(s)

            # Trickier cases: look for when 'start' and 'end' appear within a segment. In that
            # case, a new segment needs to be added with the initial and current strings truncated.
            else:
                initial = s.initial
                current = s.current
                overlaps = False

                # Truncate right side if the end is within this segment.
                if s_start < end < s_end:
                    overlaps = True
                    end_in_s = end - s_start
                    current = current[:end_in_s]
                    # Only truncate the initial string if it has not been changed. If it has
                    # been changed, then it isn't clear which characters in the initial string the
                    # truncated characters in the updated string correspond to, so conservatively
                    # assume that the segment maps to the same initial segment.
                    if not s.changed:
                        initial = initial[:end_in_s]
                    elif greedy:
                        initial = initial
                    else:
                        initial = ""
                # Truncate left side if the start is within this segment. Note that it might be
                # possible for both the start ane end to lie within this segment, hence the shared
                # 'current' and 'initial' variables.
                if s_start < start < s_end:
                    overlaps = True
                    start_in_s = start - s_start
                    current = current[start_in_s:]
                    if not s.changed:
                        initial = initial[start_in_s:]

                if overlaps:
                    new_segments.append(Segment(initial, current, s.changed))

            s_start = s_end

        return JournaledString(new_segments)

    def initial_offsets(
        self, start: int, end: int
    ) -> Tuple[Optional[int], Optional[int]]:
        """
        Convert offsets expressed relative to the current value of the string to offsets in the
        original string. The offsets will be precise wherever the string hasn't been changed. They
        will be approximate returning a conservatively large span in places where the string has
        been mutated.
        """

        # Search for the start position. Search from the end of the current
        # string backwards, to find the last possible segment that could
        # map to the initial offsets, to provide a tight mapping.
        current_segment_end = sum([len(s.current) for s in self.segments])
        initial_segment_end = sum([len(s.initial) for s in self.segments])
        start_in_initial: Optional[int] = initial_segment_end

        for s in reversed(self.segments):

            current_segment_start = current_segment_end - len(s.current)
            initial_segment_start = initial_segment_end - len(s.initial)
            if current_segment_start <= start <= current_segment_end:
                if s.changed:
                    start_in_initial = (
                        initial_segment_end
                        if start == current_segment_end
                        else initial_segment_start
                    )
                else:
                    start_in_initial = initial_segment_start + (
                        start - current_segment_start
                    )
                break

            current_segment_end -= len(s.current)
            initial_segment_end -= len(s.initial)

        # Repeat the search, this time searching forward to find the end offset.
        current_segment_start = 0
        initial_segment_start = 0
        end_in_initial: Optional[int] = initial_segment_start

        for s in self.segments:

            current_segment_end = current_segment_start + len(s.current)
            initial_segment_end = initial_segment_start + len(s.initial)
            if current_segment_start <= end <= current_segment_end:
                if s.changed and len(s.current) > 0:
                    end_in_initial = (
                        initial_segment_start
                        if end == current_segment_start
                        else initial_segment_end
                    )
                else:
                    end_in_initial = initial_segment_start + (
                        end - current_segment_start
                    )
                break

            current_segment_start += len(s.current)
            initial_segment_start += len(s.initial)

        return (start_in_initial, end_in_initial)

    def current_offsets(
        self, start: int, end: int
    ) -> Tuple[Optional[int], Optional[int]]:
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
    def from_json(json: Dict[str, Any]) -> "JournaledString":
        try:
            string = JournaledString(
                [
                    Segment(str(s["initial"]), str(s["current"]), bool(s["changed"]))
                    for s in json["segments"]
                ]
            )
            return string
        except (KeyError, TypeError) as e:
            raise ValueError(
                f"Could not instantiate MutableString from JSON {json}. Error: {e}"
            )
