import classNames from "classnames";
import React from "react";

/**
 * Patterns roughly correspond to Markdown (see https://www.markdownguide.org/basic-syntax/).
 * Patterns provide a very small subset of Markdown.
 */
const PATTERNS: MarkupPattern[] = [
  {
    start: "**",
    end: "**",
    style: "highlight",
  },
  {
    start: "~",
    end: "~",
    style: "hide",
  },
];

interface MarkupPattern {
  start: string;
  end: string;
  style: Style;
}

type Style = "plaintext" | "highlight" | "hide";

interface Span {
  style: Style;
  text: string;
}

/**
 * Split a text string with markup tags (see PATTERNS) into a sequence of spans. This function
 * performs a sequential scan of the string, looking for the next 'start' pattern if all prior
 * tags were closed, or the 'end' pattern corresponding to the last 'start' pattern if it has
 * not yet been closed. This function does not know how to handle nested patterns.
 */
function extractSpans(text: String): Span[] {
  const spans: Span[] = [];

  let searchStart = 0;
  let activePatt: MarkupPattern | undefined = undefined;

  /*
   * Scan the string for patterns indicating styled spans.
   */
  while (true) {
    /*
     * Search for the start of a new span.
     */
    if (activePatt === undefined) {
      let newPatt: MarkupPattern | undefined = undefined;
      let start = -1;
      for (const patt of PATTERNS) {
        const pattStart = text.indexOf(patt.start, searchStart);
        if (pattStart !== -1 && (start === -1 || pattStart < start)) {
          newPatt = patt;
          start = pattStart;
        }
      }
      spans.push({
        style: "plaintext",
        text: text.substring(searchStart, newPatt ? start : text.length),
      });
      if (newPatt === undefined) {
        break;
      }
      activePatt = newPatt;
      searchStart = start + newPatt.start.length;
    } else if (activePatt !== undefined) {
      /*
       * If the start of a span has been found, seek the span's end.
       */
      const end: number = text.indexOf(activePatt.end, searchStart);
      spans.push({
        style: end !== -1 ? activePatt.style : "plaintext",
        text: text.substring(searchStart, end !== -1 ? end : text.length),
      });
      if (end === -1) {
        break;
      }
      searchStart = end + activePatt.end.length;
      activePatt = undefined;
    }
  }
  return spans;
}

interface Props {
  children: string;
}

/**
 * Formats text using a simple, limited custom markup language. Used to assign a set of
 * known styles for highlighting and hiding parts of the text using text contents alone.
 */
class FormattedText extends React.PureComponent<Props> {
  render() {
    const text = this.props.children;
    const spans = extractSpans(text);
    return (
      <span className="formatted-text">
        {spans.map((s, i) => (
          <span
            key={i}
            className={classNames({
              plaintext: s.style === "plaintext",
              highlight: s.style === "highlight",
              hide: s.style === "hide",
            })}
          >
            {s.text}
          </span>
        ))}
      </span>
    );
  }
}

export default FormattedText;
