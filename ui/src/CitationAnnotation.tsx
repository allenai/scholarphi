import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import CitationTooltipBody from "./CitationTooltipBody";
import * as selectors from "./selectors";
import { BoundingBox, Citation } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

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
    return (
      <Tooltip
        interactive
        className="citation-tooltip"
        title={<CitationTooltipBody paperIds={this.props.citation.papers} />}
      >
        <div
          className="scholar-reader-annotation citation-annotation"
          style={selectors.divDimensionStyles(this.props.pageView, this.props.location)}
        />
      </Tooltip>
    );
  }
}

export default CitationAnnotation;
