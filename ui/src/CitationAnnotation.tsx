import { PDFPageViewport } from "pdfjs-dist";
import React from "react";
import { Summary } from "./semanticScholar";
import { SummaryTooltip, SummaryView } from "./SummaryTooltip";

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
  if (!isXValid(props.x) || !isYValid(props.y) || props.paperSummary === undefined) {
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
    <SummaryTooltip title={
      <React.Fragment>
        <SummaryView summary={props.paperSummary}/>
      </React.Fragment>
    }>
      <div className="citation-annotation" style={style}>
      </div>
    </SummaryTooltip>
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