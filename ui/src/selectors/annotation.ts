import { BoundingBox } from "../types/api";
import { PDFPageView } from "../types/pdfjs-viewer";

/**
 * Expects 'box' to represent location in PDF coordinates; converts to viewport coordinates.
 *  XXX(andrewhead): A slight scale correction was needed to make the bounding boxes appear in
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
  scaleCorrection = scaleCorrection || 0.9975;
  const viewport = pageView.pdfPage.getViewport({
    scale: pageView.viewport.scale * scaleCorrection
  });

  const pdfCoordinates = [
    box.left,
    box.top,
    box.left + box.width,
    box.top + box.height
  ];
  const viewportBox = viewport.convertToViewportRectangle(pdfCoordinates);

  /**
   * Based on how pdf-react transforms PDF coordinates to viewport coordinates here:
   * https://github.com/wojtekmaj/react-pdf/blob/73f505eca1bf1ae243a2b7068fce1e86b98b408a/src/Page/AnnotationLayer.jsx#L104
   */
  return {
    left: viewportBox[0],
    top: viewportBox[1],
    width: viewportBox[2] - viewportBox[0],
    height: viewportBox[1] - viewportBox[3]
  };
}

export function boundingBoxString(boundingBox: BoundingBox) {
  return `${boundingBox.page}-L${boundingBox.left}-T${boundingBox.top}-W${boundingBox.width}-H${boundingBox.height}`;
}
