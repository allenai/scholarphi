import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import { GlossStyle } from "./settings";
import SymbolDefinitionGloss from "./SymbolDefinitionGloss";
import SymbolPropertyEvaluationGloss from "./SymbolPropertyEvaluationGloss";
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
  glossStyle: GlossStyle;
  glossEvaluationEnabled: boolean;
  handleSelect: (
    symbolId: string,
    annotationId: string,
    annotationSpanId: string
  ) => void;
  handleStartSymbolSearch: (id: string) => void;
}

type GlossType = "definition" | "property-evaluation" | null;

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
        glossStyle={this.props.glossStyle}
        glossContent={
          !this.props.glossEvaluationEnabled ? (
            <SymbolDefinitionGloss symbol={this.props.symbol} />
          ) : (
            <SymbolPropertyEvaluationGloss
              id={this.props.id}
              symbol={this.props.symbol}
            />
          )
        }
        source={this.props.symbol.attributes.source}
        handleSelect={this.handleSelect}
      />
    );
  }
}

export default SymbolAnnotation;
