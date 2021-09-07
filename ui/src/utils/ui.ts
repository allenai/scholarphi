import { PDFPageProxy } from "pdfjs-dist/types/display/api";
import React from "react";
import { PageModel, Pages } from "../state";
import { BoundingBox } from "../api/types";
import { PDFPageView } from "../types/pdfjs-viewer";
import { Dimensions, Rectangle } from "../types/ui";

/*
 * Corresponds to the 'elevation' property of 'Paper' and 'Card' components from Material UI.
 * Can take on values of 0 to 24 inclusive. See
 * https://material.io/design/environment/elevation.html#elevation-in-material-design
 */
export const TOOLTIP_ELEVATION = 8;

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
 * @param {boolean} withEllipis whether to include an ellipsis after the truncation, defaults to true
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
 * Find the parent element of a node matching a filter.
 */
export function findParentElement(
  node: Node,
  filter: (element: HTMLElement) => boolean
): HTMLElement | null {
  let parent: HTMLElement | null =
    node instanceof HTMLElement ? node : node.parentElement;
  while (parent !== null) {
    if (filter(parent)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

/**
 * Get the page model (if any) that contains this node.
 */
export function getPageContainingNode(
  node: Node,
  pages: Pages
): PageModel | null {
  const pageElement = findParentElement(
    node,
    (e) => e instanceof HTMLDivElement && e.classList.contains("page")
  );

  if (pageElement === null) {
    return null;
  }

  for (const page of Object.values(pages)) {
    if (page.view.div === pageElement) {
      return page;
    }
  }

  return null;
}

/**
 * Convert a bounding box in ratio coordinates to PDF coordinates (i.e., in points). In the PDF
 * coordinate system, 'top' is the number of points from the bottom of the page.
 */
export function convertBoxToPdfCoordinates(view: PDFPageView, box: Rectangle) {
  /*
   * Dimensions of the page in PDF coordinates are stored in a page's 'view' property.
   * To see how these coordinates get loaded from PDF metadata (specifically, the "ViewArea"
   * tags), see these two links:
   * * https://github.com/mozilla/pdf.js/blob/cd6d0894894c97264eca993b10d0d9faa02fa829/src/core/document.js#L177
   * * https://github.com/mozilla/pdf.js/blob/cd6d0894894c97264eca993b10d0d9faa02fa829/src/core/obj.js#L522
   * Also see information about the "ViewArea" tag in the PDF spec, "PDF 32000-1:2008", page 628.
   */
  //
  const [pdfLeft, pdfBottom, pdfRight, pdfTop] = view.pdfPage.view;
  const pdfWidth = pdfRight - pdfLeft;
  const pdfHeight = pdfTop - pdfBottom;
  return {
    left: pdfLeft + box.left * pdfWidth,
    top: pdfBottom + (1 - box.top) * pdfHeight,
    width: box.width * pdfWidth,
    height: box.height * pdfHeight,
  };
}

/**
 * Get the 'left', 'top', 'width', and 'height' CSS parameters for a paper annotation from a
 * bounding box for that annotation. The bounding box is expected to be expressed in
 * ratio coordinates (see the docstring for the BoundingBox type). The values returned will be
 * absolute pixel positions. The caller can optionally specify a scaling favor (scaleCorrection).
 * You shouldn't need to use it, though in past versions of this interface it was necessary to
 * correct subtle issues in the positioning of annotations.
 */
export function getPositionInPageView(
  pageView: PDFPageView,
  box: Rectangle,
  scaleCorrection?: number
) {
  scaleCorrection = scaleCorrection || 1;
  const pageDimensions = getPageViewDimensions(pageView);

  return {
    left: box.left * pageDimensions.width * scaleCorrection,
    top: box.top * pageDimensions.height * scaleCorrection,
    width: box.width * pageDimensions.width * scaleCorrection,
    height: box.height * pageDimensions.height * scaleCorrection,
  };
}

/**
 * Get bounding boxes for all ranges in a text selection. Consecutive bounding boxes within a
 * range are merged together, if sufficiently close to each other.
 */
export function getBoundingBoxesForSelection(
  selection: Selection,
  pages: Pages
) {
  /*
   * Get bounding boxes of all selected ranges.
   */
  const boxes: BoundingBox[] = [];
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);

    /*
     * Find the page that contains this range.
     */
    const page = getPageContainingNode(range.commonAncestorContainer, pages);

    /*
     * If a page was found, save bounding boxes for the selection, in ratio coordinates
     * relative to the page view 'div'.
     */
    if (page !== null) {
      const { pageNumber } = page.view.pdfPage;
      const pageRect = page.view.div.getBoundingClientRect();
      const rangeRects = range.getClientRects();
      let lastBox = undefined;

      for (let i = 0; i < rangeRects.length; i++) {
        const rangeRect = rangeRects.item(i);
        if (rangeRect !== null) {
          /*
           * Compute dimensions for a new box.
           */
          const left = (rangeRect.left - pageRect.left) / pageRect.width;
          const top = (rangeRect.top - pageRect.top) / pageRect.height;
          const width = rangeRect.width / pageRect.width;
          const height = rangeRect.height / pageRect.height;
          const right = left + width;
          const bottom = top + height;

          /*
           * If this box appears right after the last box and is vertically aligned
           * with the last box, merge it with the last box. This loop takes advantage of
           * how getClientRects() iterates over boxes in content order (see
           * https://drafts.csswg.org/cssom-view/#dom-range-getclientrects).
           */
          let boxMergedWithPrevious = false;
          if (lastBox !== undefined) {
            const lastBoxRight = lastBox.left + lastBox.width;
            const lastBoxBottom = lastBox.top + lastBox.height;
            const SMALL_HORIZONTAL_DELTA = 0.01; // 1% of page width
            const SMALL_VERTICAL_DElTA = 0.01; // 1% of page height

            if (
              left - lastBoxRight < SMALL_HORIZONTAL_DELTA &&
              Math.abs(top - lastBox.top) < SMALL_VERTICAL_DElTA &&
              Math.abs(bottom - lastBoxBottom) < SMALL_VERTICAL_DElTA
            ) {
              lastBox.width = right - lastBox.left;
              lastBox.top = Math.min(top, lastBox.top);
              lastBox.height = Math.max(bottom, lastBoxBottom) - lastBox.top;
              boxMergedWithPrevious = true;
            }
          }

          /*
           * Create a new bounding box if it couldn't be merged with the previous box.
           */
          if (!boxMergedWithPrevious) {
            const box: BoundingBox = {
              left,
              top,
              width,
              height,
              page: pageNumber - 1,
              source: "human-annotation",
            };
            boxes.push(box);
            lastBox = box;
          }
        }
      }
    }
  }

  return boxes;
}

/**
 * Call this function whenever you want to get the width and height of a pageView object from
 * PDF.js. This function avoids gotchas in computing the size of the page view. Width and
 * height are returned in pixels.
 */
export function getPageViewDimensions(pageView: PDFPageView): Dimensions {
  /*
   * Use the viewport width and height here, instead of the scroll width and height of the
   * pageView's <div/>. The reason is that the <div/> might increase in its width and height as
   * we add annotations to it, though the viewport should be set once and stay constant each
   * time that the page is rendered.
   */
  return { width: pageView.viewport.width, height: pageView.viewport.height };
}

/**
 * Get the page number for a PDFPageView of PDFPageProxy. While the page number used internally
 * by pdf.js starts at 1, the numbers used by this application start at 0, so this function
 * converts the pdf.js number to a 0-based number.
 */
export function getPageNumber(p: PDFPageView | PDFPageProxy) {
  if ((p as any).pdfPage !== undefined) {
    return (p as PDFPageView).pdfPage.pageNumber - 1;
  } else {
    return (p as PDFPageProxy).pageNumber - 1;
  }
}

/**
 * Programmatically trigger a click of a Material-UI button that makes it look like the button has
 * actually been clicked. This requires simulating a 'mousedown' event, which starts a background
 * 'ripple', followed by a 'mouseup' event. The ripple appears to last from the 'mousedown' event
 * until the 'mouseup' event, and must have some duration. The 'click' event, however, is dispatched
 * immediately so that the button click can be processed as soon as possible.
 */
export function simulateMaterialUiButtonClick(element: HTMLButtonElement) {
  const MOUSE_EVENT_OPTIONS = { cancelable: true, bubbles: true };
  const mouseDownEvent = new MouseEvent("mousedown", MOUSE_EVENT_OPTIONS);
  const mouseUpEvent = new MouseEvent("mouseup", MOUSE_EVENT_OPTIONS);
  const clickEvent = new MouseEvent("click", MOUSE_EVENT_OPTIONS);

  /*
   * Start the ripple effect.
   */
  element.dispatchEvent(mouseDownEvent);
  /*
   * Trigger the click as soon as possible.
   */
  element.dispatchEvent(clickEvent);
  /*
   * The ripple will continue to expand until the 'mouseup' event is dispatched. For it to look
   * like the button has been pressed to a user, 'RIPPLE_TIME_MS' needs to be greater than 0,
   * and is most visually salient if it is more than 100 ms.
   */
  const RIPPLE_TIME_MS = 200;
  setTimeout(() => {
    element.dispatchEvent(mouseUpEvent);
  }, RIPPLE_TIME_MS);
}

export function sortByFrequency(strings: string[]) {
  /*
   * Count up frequency of each item.
   */
  const counts = strings.reduce((c, s) => {
    c[s] = (c[s] || 0) + 1;
    return c;
  }, {} as { [s: string]: number });

  /*
   * Sort items by their frequency.
   */
  const countsKeys = Object.keys(counts);
  const indexes = countsKeys.map((_, i) => i);
  indexes.sort((i1, i2) => {
    const s1 = countsKeys[i1];
    const s2 = countsKeys[i2];
    return counts[s2] - counts[s1];
  });

  return indexes.map((i) => countsKeys[i]);
}

/**
 * Join a list of strings into a text list, where strings are separated by commas with an
 * 'and' before the last string.
 */
export function joinStrings(strings: string[]) {
  if (strings.length === 0) {
    return "";
  }
  if (strings.length === 1) {
    return strings[0];
  }
  if (strings.length === 2) {
    return strings[0] + " and " + strings[1];
  }
  if (strings.length > 2) {
    return (
      strings.slice(0, strings.length - 1).join(", ") +
      ", and" +
      strings[strings.length - 1]
    );
  }
}

export function getScrollCoordinates(element: HTMLElement) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop,
    scrollWidth: element.scrollWidth,
    scrollHeight: element.scrollHeight,
    clientWidth: element.clientWidth,
    clientHeight: element.clientHeight,
  };
}

export function getElementCoordinates(element: HTMLElement) {
  return {
    offsetLeft: element.offsetLeft,
    offsetTop: element.offsetTop,
    clientWidth: element.clientWidth,
    clientHeight: element.clientHeight,
  };
}

/**
 * TODO(andrewhead): Handle the case of arXiv publications that have multiple versions. How do we
 * make sure we're querying for the same version of paper data as the paper that was opened?
 */
 export function extractArxivId(url: string): string | undefined {
  const matches = url.match(/arxiv\.org\/pdf\/(.*)(?:\.pdf)/) || [];
  return matches[1];
}

export function updateAlpha(color: string, opacity: number): string {
  // Keep first character (#) denoting hex value, and next six characters denoting RGB values
  color = color.substring(0, 7);
  const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase();
}
