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
    return (
      <div className="symbol-preview favorite-container">
        {/* TODO(andrewhead): In preview, only show the sentence, if possible (i.e if at least one
         * sentence is found that contains this symbol). */}
        <PaperClipping
          pageNumber={this.props.symbol.bounding_boxes[0].page + 1}
          highlightBoxes={[this.props.symbol.bounding_boxes[0]]}
          onClick={this.requestSelectSymbol.bind(this)}
        />
      </div>
    );
  }
}

export default SymbolPreview;
