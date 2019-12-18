import React from "react";
import FavoriteButton from "./FavoriteButton";
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
              pageNumber={this.props.symbol.bounding_box.page + 1}
              highlightBoxes={[this.props.symbol.bounding_box]}
              onClick={() => setJumpSymbol(this.props.symbol)}
            />
            <FavoriteButton
              opaque
              favoritableId={{
                type: "symbol-view",
                entityId: this.props.symbol.id
              }}
            />
          </div>
        )}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default SymbolPreview;
