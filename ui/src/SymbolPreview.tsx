import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import PaperClipping from "./PaperClipping";
import { Sentences } from "./state";
import { Symbol } from "./types/api";

interface SymbolPreviewProps {
  pdfDocument: PDFDocumentProxy;
  sentences: Sentences | null;
  symbol: Symbol;
  handleSelectSymbol: (id: string) => void;
}

export class SymbolPreview extends React.PureComponent<SymbolPreviewProps> {
  onClick() {
    this.props.handleSelectSymbol(this.props.symbol.id);
  }

  render() {
    const { symbol } = this.props;
    return (
      <div className="symbol-preview favorite-container">
        <PaperClipping
          pdfDocument={this.props.pdfDocument}
          sentences={this.props.sentences}
          pageNumber={symbol.bounding_boxes[0].page + 1}
          sentenceId={symbol.sentence !== null ? symbol.sentence : undefined}
          highlights={[this.props.symbol.bounding_boxes[0]]}
          onClick={this.onClick.bind(this)}
        />
      </div>
    );
  }
}

export default SymbolPreview;
