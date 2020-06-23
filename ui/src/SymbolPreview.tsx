import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import PaperClipping from "./PaperClipping";
import { Sentence, Symbol } from "./types/api";

interface Props {
  pdfDocument: PDFDocumentProxy;
  sentence?: Sentence | null;
  symbol: Symbol;
  handleSelectSymbol?: (id: string) => void;
}

export class SymbolPreview extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (this.props.handleSelectSymbol !== undefined) {
      this.props.handleSelectSymbol(this.props.symbol.id);
    }
  }

  render() {
    const { symbol } = this.props;
    return (
      <div className="symbol-preview">
        <PaperClipping
          pdfDocument={this.props.pdfDocument}
          sentence={this.props.sentence}
          pageNumber={symbol.bounding_boxes[0].page + 1}
          highlights={[this.props.symbol.bounding_boxes[0]]}
          onClick={this.onClick}
        />
      </div>
    );
  }
}

export default SymbolPreview;
