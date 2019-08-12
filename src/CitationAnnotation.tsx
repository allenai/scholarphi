import { PDFPageViewport } from "pdfjs-dist";
import React from "react";
import { Summary } from "./semanticScholar";

/**
 * Dimensions are expressed in PDF coordinates, not in viewport coordinates.
 */
interface CitationAnnotationProps {
  x: number;
  y: number;
  width: number;
  height: number;
  paperSummary?: Summary;
  /**
   * Used to convert PDF coordinates to viewport coordinates.
   */
  pageViewport: PDFPageViewport;
}

export function CitationAnnotation(props: CitationAnnotationProps) {
  if (!isXValid(props.x) || !isYValid(props.y)) {
    return null;
  }
  const pdfCoordinates = [props.x, props.y, props.x + props.width, props.y + props.height];
  const [
    viewportLeft,
    viewportBottom,
    viewportRight,
    viewportTop
  ] = props.pageViewport.convertToViewportRectangle(pdfCoordinates);
  /**
   * XXX(andrewhead): No idea why I need to flip the transformed coordinates vertically. This may
   * be related to how scale and other viewport properties get initialized. Look to how pdf-react
   * transforms PDF coordinates to viewport coordinates here:
   * https://github.com/wojtekmaj/react-pdf/blob/73f505eca1bf1ae243a2b7068fce1e86b98b408a/src/Page/AnnotationLayer.jsx#L104
   */
  const style = {
    left: viewportLeft,
    bottom: viewportTop,
    width: viewportRight - viewportLeft,
    height: viewportBottom - viewportTop
  };

  return (
    <div className="citation-annotation" onMouseOver={() => console.log(props.paperSummary)} style={style}>
    </div>
  );
}

/**
 * Grobid, the PDF analyzer that may be used here to provide annotations, sometimes assignes tokens
 * an 'x' and 'y' of -1. These positions cannot be plotted.
 */
function isXValid(x: number) {
  return x !== -1;
}

function isYValid(y: number) {
  return y !== -1;
}