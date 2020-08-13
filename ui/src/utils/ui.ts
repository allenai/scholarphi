import { PDFPageProxy } from "pdfjs-dist";
import React from "react";
import { PageModel, Pages } from "../state";
import { BoundingBox } from "../types/api";
import { PDFPageView } from "../types/pdfjs-viewer";

interface Rectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

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
export function getPageViewDimensions(pageView: PDFPageView) {
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
 * converts the pdf.js number to a 0-based one that can be used elsewhere in our application.
 */
export function getPageNumber(p: PDFPageView | PDFPageProxy) {
  if ((p as any).pdfPage !== undefined) {
    return (p as PDFPageView).pdfPage.pageNumber - 1;
  } else {
    return (p as PDFPageProxy).pageNumber - 1;
  }
}
