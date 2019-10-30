import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import CitationTooltipBody from "./CitationTooltipBody";
import { BoundingBox, Citation } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

/**
 * Dimensions are expressed in PDF coordinates, not in viewport coordinates.
 */
interface CitationAnnotationProps {
  location: BoundingBox;
  citation: Citation;
  /**
   * Used for converting PDF coordinates to screen coordinates.
   */
  pageView: PDFPageView;
}

export class CitationAnnotation extends React.Component<CitationAnnotationProps, {}> {
  render() {
    /**
     * XXX(andrewhead): A slight scale correction was needed to make the bounding boxes appear in
     * just the right place on a test PDF. Maybe this reflects some round-off error in bounding box
     * location detection in the data processing scripts?
     */
    const SCALE_CORRECTION = 0.9975;
    const viewport = this.props.pageView.pdfPage.getViewport({
      scale: this.props.pageView.viewport.scale * SCALE_CORRECTION
    });

    const box = this.props.location;
    const pdfCoordinates = [box.left, box.top, box.left + box.width, box.top + box.height];
    const viewportBox = viewport.convertToViewportRectangle(pdfCoordinates);

    /**
     * Based on how pdf-react transforms PDF coordinates to viewport coordinates here:
     * https://github.com/wojtekmaj/react-pdf/blob/73f505eca1bf1ae243a2b7068fce1e86b98b408a/src/Page/AnnotationLayer.jsx#L104
     */
    const dimensionStyles = {
      left: viewportBox[0],
      top: viewportBox[1],
      width: viewportBox[2] - viewportBox[0],
      height: viewportBox[1] - viewportBox[3]
    };

    return (
      <Tooltip
        interactive
        leaveDelay={500}
        className="citation-tooltip"
        title={<CitationTooltipBody paperIds={this.props.citation.papers} />}
      >
        <div className="citation-annotation" style={dimensionStyles} />
      </Tooltip>
    );
  }
}

export default CitationAnnotation;
