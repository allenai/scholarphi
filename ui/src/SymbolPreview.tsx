import React from "react";
import PaperClipping from "./PaperClipping";
import { ScholarReaderContext } from "./state";
import { Symbol } from "./types/api";

interface SymbolPreviewProps {
  symbol: Symbol;
}

export class SymbolPreview extends React.PureComponent<SymbolPreviewProps> {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ setJumpSymbol }) => (
          <div className="symbol-preview favorite-container">
            <PaperClipping
              pageNumber={this.props.symbol.bounding_boxes[0].page + 1}
              highlightBoxes={[this.props.symbol.bounding_boxes[0]]}
              onClick={() => setJumpSymbol(this.props.symbol)}
            />
          </div>
        )}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default SymbolPreview;
