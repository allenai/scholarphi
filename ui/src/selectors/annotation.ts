import { BoundingBox } from "../types/api";
import { PDFPageView } from "../types/pdfjs-viewer";
import { getPageViewDimensions } from "../ui-utils";

/**
 * Get the 'left', 'top', 'width', and 'height' CSS parameters for a paper annotation from a
 * bounding box for that annotation. The bounding box is expected to be expressed in
 * ratio coordinates (see the docstring for the BoundingBox type). The values returned will be
 * absolute pixel positions. The caller can optionally specify a scaling favor (scaleCorrection).
 * You shouldn't need to use it, though in past versions of this interface it was necessary to
 * correct subtle issues in the positioning of annotations.
 */
export function divDimensionStyles(
  pageView: PDFPageView,
  box: BoundingBox,
  scaleCorrection?: number
) {
  scaleCorrection = scaleCorrection || 1;
  const pageDimensions = getPageViewDimensions(pageView);

  return {
    left: box.left * pageDimensions.width * scaleCorrection,
    top: box.top * pageDimensions.height * scaleCorrection,
    width: box.width * pageDimensions.width * scaleCorrection,
    height: box.height * pageDimensions.height * scaleCorrection
  };
}

export function boundingBoxString(boundingBox: BoundingBox) {
  return `${boundingBox.page}-L${boundingBox.left}-T${boundingBox.top}-W${boundingBox.width}-H${boundingBox.height}`;
}
