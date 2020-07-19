import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import SymbolPropertiesTooltipBody from "./SymbolPropertiesTooltipBody";
import { Symbol } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  id: string;
  className?: string;
  pageView: PDFPageView;
  pageNumber: number;
  symbol: Symbol;
  active: boolean;
  selected: boolean;
  selectedSpanIds: string[] | null;
  isFindMatch?: boolean;
  isFindSelection?: boolean;
  tooltip: TooltipType;
  handleSelect: (
    symbolId: string,
    annotationId: string,
    annotationSpanId: string
  ) => void;
  handleStartSymbolSearch: (id: string) => void;
}

type TooltipType = "property-viewer" | null;

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
        className={classNames("symbol-annotation", this.props.className)}
        boundingBoxes={this.props.symbol.attributes.bounding_boxes}
        pageNumber={this.props.pageNumber}
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanIds={this.props.selectedSpanIds}
        isFindMatch={this.props.isFindMatch}
        isFindSelection={this.props.isFindSelection}
        tooltipContent={
          this.props.tooltip === "property-viewer" ? (
            <SymbolPropertiesTooltipBody symbol={this.props.symbol} />
          ) : null
        }
        source={this.props.symbol.attributes.source}
        handleSelect={this.handleSelect}
      />
    );
  }
}

export default SymbolAnnotation;
