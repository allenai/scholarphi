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
  handleSelect: (id: string) => void;
  handleSelectSpan: (id: string) => void;
  handleSelectEntity: (id: string) => void;
}

export class TermAnnotation extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.onSelected = this.onSelected.bind(this);
  }

  onSelected() {
    this.props.handleSelectEntity(this.props.term.id);
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={this.props.id}
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        boundingBoxes={this.props.boundingBoxes}
        source={this.props.term.attributes.source}
        tooltipContent={<TermTooltipBody term={this.props.term} />}
        handleSelectAnnotation={this.props.handleSelect}
        handleSelectAnnotationSpan={this.props.handleSelectSpan}
        onSelected={this.onSelected}
      />
    );
  }
}

export default TermAnnotation;
