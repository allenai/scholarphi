import React from "react";
import PaperClipping from "./PaperClipping";
import { ScholarReaderContext } from "./state";
import { Symbol } from "./types/api";

interface SymbolPreviewProps {
  symbol: Symbol;
}

export class SymbolPreview extends React.Component<SymbolPreviewProps> {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ setJumpSymbol }) => (
          <div
            className="symbol-preview"
            onClick={() => setJumpSymbol(this.props.symbol)}
          >
            <PaperClipping
              pageNumber={this.props.symbol.bounding_box.page + 1}
              highlightBoxes={[this.props.symbol.bounding_box]}
            />
          </div>
        )}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default SymbolPreview;
