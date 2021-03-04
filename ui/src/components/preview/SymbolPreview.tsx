import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import React from "react";
import { Sentence, Symbol } from "../../api/types";
import PaperClipping from "./PaperClipping";

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
    if (symbol.attributes.bounding_boxes.length === 0) {
      return (
        <div className="symbol-preview empty">
          There are no locations associated with this symbol.
        </div>
      );
    }
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
