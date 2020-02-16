import { BoundingBox } from "../types/api";
import { PDFPageView } from "../types/pdfjs-viewer";

/**
 * Expects 'box' to represent location in PDF coordinates; converts to viewport coordinates.
 * XXX(andrewhead): A slight scale correction was needed to make the bounding boxes appear in
 * just the right place on a test PDF. Maybe this reflects some round-off error in bounding box
 * location detection in the data processing scripts; this needs further investigation. For
 * annotations added by users directly in this application, the scale correction should be set
 * to 1 for the annotation to appear in precisely the right place.
 */
export function divDimensionStyles(
  pageView: PDFPageView,
  box: BoundingBox,
  scaleCorrection?: number
) {
  scaleCorrection = scaleCorrection || 1;

  return {
    left: box.left * pageView.viewport.width * scaleCorrection,
    top: box.top * pageView.viewport.height * scaleCorrection,
    width: box.width * pageView.viewport.width * scaleCorrection,
    height: box.height * pageView.viewport.height * scaleCorrection
  };
}

export function boundingBoxString(boundingBox: BoundingBox) {
  return `${boundingBox.page}-L${boundingBox.left}-T${boundingBox.top}-W${boundingBox.width}-H${boundingBox.height}`;
}
