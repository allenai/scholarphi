import React from "react";
import Annotation from "./Annotation";
import TermTooltipBody from "./TermTooltipBody";
import { BoundingBox, Term } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  pageView: PDFPageView;
  term: Term;
  id: string;
  boundingBoxes: BoundingBox[];
  active: boolean;
  selected: boolean;
  selectedSpanId: string | null;
  handleSelect: (
    termId: string,
    annotationId: string,
    annotationSpanId: string
  ) => void;
}

export class TermAnnotation extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(annotationId: string, spanId: string) {
    this.props.handleSelect(this.props.term.id, annotationId, spanId);
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={this.props.id}
        className="term-annotation"
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        boundingBoxes={this.props.boundingBoxes}
        source={this.props.term.attributes.source}
        tooltipContent={<TermTooltipBody term={this.props.term} />}
        handleSelect={this.handleSelect}
      />
    );
  }
}

export default TermAnnotation;
