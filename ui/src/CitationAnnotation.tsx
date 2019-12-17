import React from "react";
import Annotation from "./Annotation";
import CitationTooltipBody from "./CitationTooltipBody";
import { BoundingBox, Citation } from "./types/api";

interface CitationAnnotationProps {
  location: BoundingBox;
  citation: Citation;
}

export class CitationAnnotation extends React.PureComponent<
  CitationAnnotationProps,
  {}
> {
  render() {
    return (
      <Annotation
        id={`citation-${this.props.citation.id}-annotation`}
        location={this.props.location}
        tooltipContent={
          <CitationTooltipBody
            citation={this.props.citation}
            paperIds={this.props.citation.papers} />
        }
      />
    );
  }
}

export default CitationAnnotation;
