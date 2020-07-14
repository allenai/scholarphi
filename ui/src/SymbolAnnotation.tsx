import React from "react";
import Annotation from "./Annotation";
import { Symbol } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  pageView: PDFPageView;
  pageNumber: number;
  symbol: Symbol;
  id: string;
  active: boolean;
  selected: boolean;
  selectedSpanId: string | null;
  isFindMatch?: boolean;
  isFindSelection?: boolean;
  handleSelect: (
    symbolId: string,
    annotationId: string,
    annotationSpanId: string
  ) => void;
  handleStartSymbolSearch: (id: string) => void;
}

export class SymbolAnnotation extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(annotationId: string, spanId: string) {
    this.props.handleSelect(this.props.symbol.id, annotationId, spanId);
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={this.props.id}
        className="symbol-annotation"
        boundingBoxes={this.props.symbol.attributes.bounding_boxes}
        pageNumber={this.props.pageNumber}
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        isFindMatch={this.props.isFindMatch}
        isFindSelection={this.props.isFindSelection}
        tooltipContent={null}
        source={this.props.symbol.attributes.source}
        handleSelect={this.handleSelect}
      />
    );
  }
}

export default SymbolAnnotation;
