import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import CitationTooltipBody from "./CitationTooltipBody";
import { BoundingBox, Citation } from "./types/api";

interface CitationAnnotationProps {
  boundingBoxes: BoundingBox[];
  citation: Citation;
  showHint?: boolean;
}

export class CitationAnnotation extends React.PureComponent<
  CitationAnnotationProps,
  {}
> {
  render() {
    return (
      <Annotation
        id={`citation-${this.props.citation.id}-annotation`}
        className={classNames({ "annotation-hint": this.props.showHint })}
        source={this.props.citation.source}
        boundingBoxes={this.props.boundingBoxes}
        tooltipContent={
          <CitationTooltipBody
            citation={this.props.citation}
            paperId={this.props.citation.paper}
          />
        }
      />
    );
  }
}

export default CitationAnnotation;
