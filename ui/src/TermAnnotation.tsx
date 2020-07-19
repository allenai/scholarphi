import React from "react";
import Annotation from "./Annotation";
import TermTooltipBody from "./TermTooltipBody";
import { Term } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  pageView: PDFPageView;
  pageNumber: number;
  term: Term;
  id: string;
  active: boolean;
  selected: boolean;
  selectedSpanIds: string[] | null;
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
        selectedSpanIds={this.props.selectedSpanIds}
        boundingBoxes={this.props.term.attributes.bounding_boxes}
        pageNumber={this.props.pageNumber}
        source={this.props.term.attributes.source}
        tooltipContent={<TermTooltipBody term={this.props.term} />}
        handleSelect={this.handleSelect}
      />
    );
  }
}

export default TermAnnotation;
