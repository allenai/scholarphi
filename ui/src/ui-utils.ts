import React from "react";
import { PDFPageView } from "./types/pdfjs-viewer";

export function getMouseXY(event: React.MouseEvent) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
}

export function isKeypressEscape(event: React.KeyboardEvent | KeyboardEvent) {
  if (
    event.key !== undefined &&
    (event.key === "Esc" || event.key === "Escape")
  ) {
    return true;
  }
  if (event.keyCode !== undefined && event.keyCode === 27) {
    return true;
  }
  return false;
}

const PATTERN_NON_WORD_CHAR = /\W/;
const PATTERN_WORD_CHAR = /\w/;
const ELLIPSIS = "…";

/**
 * Truncates the provided text such that no more than limit characters are rendered and adds an
 * ellipsis upon truncation by default.  If the text is shorter than the provided limit, the full
 * text is returned.
 *
 * This method was ported from Semantic Scholar's UI codebase. It's a UI
 * utility.
 *
 * @param {string} text The text to truncate.
 * @param {number} limit The maximum number of characters to show.
 * @param {boolean} whether to include an ellipsis after the truncation, defaults to true
 *
 * @return {string} the truncated text, or full text if it's shorter than the provided limit.
 */
export function truncateText(
  text: string,
  limit: number,
  withEllipsis: boolean = true
): string {
  if (typeof limit !== "number") {
    throw new Error("limit must be a number");
  }

  if (withEllipsis) {
    limit -= ELLIPSIS.length;
  }

  if (text.length > limit) {
    while (
      limit > 1 &&
      (!PATTERN_WORD_CHAR.test(text[limit - 1]) ||
        !PATTERN_NON_WORD_CHAR.test(text[limit]))
    ) {
      limit -= 1;
    }
    if (limit === 1) {
      return text;
    } else {
      const truncatedText = text.substring(0, limit);
      return withEllipsis ? truncatedText + ELLIPSIS : truncatedText + ".";
    }
  } else {
    return text;
  }
}

/**
 * Call this function whenever you want to get the width and height of a pageView object from
 * PDF.js. This function avoids gotchas in computing the size of the page view. Width and
 * height are returned in pixels.
 */
export function getPageViewDimensions(pageView: PDFPageView) {
  /*
   * Use the viewport width and height here, instead of the scroll width and height of the
   * pageView's <div/>. The reason is that the <div/> might increase in its width and height as
   * we add annotations to it, though the viewport should be set once and stay constant each
   * time that the page is rendered.
   */
  return { width: pageView.viewport.width, height: pageView.viewport.height };
}
