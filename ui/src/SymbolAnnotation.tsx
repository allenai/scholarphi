import React from "react";
import Annotation from "./Annotation";
import { BoundingBox, Symbol } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  pageView: PDFPageView;
  symbol: Symbol;
  id: string;
  boundingBoxes: BoundingBox[];
  active: boolean;
  selected: boolean;
  selectedSpanId: string | null;
  isFindMatch?: boolean;
  isFindSelection?: boolean;
  handleSelectEntity: (id: string) => void;
  handleStartSymbolSearch: (id: string) => void;
  handleSelect: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
}

export class SymbolAnnotation extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onSelected = this.onSelected.bind(this);
  }

  onSelected() {
    this.props.handleSelectEntity(this.props.symbol.id);
    this.props.handleStartSymbolSearch(this.props.symbol.id);
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={this.props.id}
        className="symbol-annotation"
        boundingBoxes={this.props.boundingBoxes}
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        isFindMatch={this.props.isFindMatch}
        isFindSelection={this.props.isFindSelection}
        tooltipContent={null}
        source={this.props.symbol.attributes.source}
        handleSelectAnnotation={this.props.handleSelect}
        handleSelectAnnotationSpan={this.props.handleSelectAnnotationSpan}
        onSelected={this.onSelected}
      />
    );
  }
}

export default SymbolAnnotation;
