import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import PaperClipping from "./PaperClipping";
import { Sentence, Symbol } from "./types/api";

interface Props {
  pdfDocument: PDFDocumentProxy;
  sentence?: Sentence | null;
  symbol: Symbol;
  onLoaded?: (element: HTMLDivElement) => void;
  handleSelectSymbol?: (id: string) => void;
}

/**
 * The reason this component is created, instead of using PaperClipping directly, is that it
 * permits symbol information to be bound to the component, which can be used to select
 * symbols in the click callback.
 */
export class SymbolPreview extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onClippingLoaded = this.onClippingLoaded.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onClippingLoaded(_: HTMLDivElement, canvas: HTMLCanvasElement) {
    this.clippingCanvas = canvas;
    if (this.props.onLoaded !== undefined && this.element !== null) {
      this.props.onLoaded(this.element);
    }
  }

  onClick() {
    if (this.props.handleSelectSymbol !== undefined) {
      this.props.handleSelectSymbol(this.props.symbol.id);
    }
  }

  render() {
    const { symbol } = this.props;
    return (
      <div ref={(ref) => (this.element = ref)} className="symbol-preview">
        <PaperClipping
          pdfDocument={this.props.pdfDocument}
          sentence={this.props.sentence}
          pageNumber={symbol.attributes.bounding_boxes[0].page + 1}
          highlights={[this.props.symbol.attributes.bounding_boxes[0]]}
          onLoaded={this.onClippingLoaded}
          onClick={this.onClick}
        />
      </div>
    );
  }

  element: HTMLDivElement | null = null;
  clippingCanvas: HTMLCanvasElement | null = null;
}

export default SymbolPreview;
