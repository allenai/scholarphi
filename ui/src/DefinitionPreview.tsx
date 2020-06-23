import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import SymbolPreview from "./SymbolPreview";
import { Sentence, Symbol } from "./types/api";

interface Props {
  pdfDocument: PDFDocumentProxy;
  symbol: Symbol;
  sentence: Sentence | null;
}

class DefinitionPreview extends React.PureComponent<Props> {
  render() {
    return (
      <Card className="definition-preview">
        <CardContent>
          <SymbolPreview
            pdfDocument={this.props.pdfDocument}
            symbol={this.props.symbol}
            sentence={this.props.sentence}
          />
        </CardContent>
      </Card>
    );
  }
}

export default DefinitionPreview;
