import React from "react";
import PaperClipping from "./PaperClipping";
import { ScholarReaderContext } from "./state";
import { Symbol } from "./types/api";

interface SymbolPreviewProps {
  symbol: Symbol;
}

export class SymbolPreview extends React.PureComponent<SymbolPreviewProps> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  requestSelectSymbol() {
    const { setSelectedEntity, selectAnnotationForEntity } = this.context;
    setSelectedEntity(this.props.symbol.id, "symbol");
    selectAnnotationForEntity(this.props.symbol.id, "symbol");
  }

  render() {
    const { symbol } = this.props;
    return (
      <div className="symbol-preview favorite-container">
        <PaperClipping
          pageNumber={symbol.bounding_boxes[0].page + 1}
          sentenceId={symbol.sentence !== null ? symbol.sentence : undefined}
          highlights={[this.props.symbol.bounding_boxes[0]]}
          onClick={this.requestSelectSymbol.bind(this)}
        />
      </div>
    );
  }
}

export default SymbolPreview;
