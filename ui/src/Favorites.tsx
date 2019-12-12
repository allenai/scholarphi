import React from "react";
import { keyToFavoritesId } from "./FavoriteButton";
import PaperSummary from "./PaperSummary";
import { ScholarReaderContext } from "./state";
import SymbolPreview from "./SymbolPreview";

export class Favorites extends React.Component {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ favorites, symbols }) => {
          return Object.keys(favorites).map(favoritesKey => {
            if (favorites[favoritesKey] !== true) {
              return null;
            }
            const favoritesId = keyToFavoritesId(favoritesKey);
            if (favoritesId.type === "symbol-view") {
              let symbol;
              for (let i = 0; i < symbols.length; i++) {
                if (symbols[i].id === favoritesId.entityId) {
                  symbol = symbols[i];
                  break;
                }
              }
              if (symbol !== undefined) {
                return (
                  <div className="favorite">
                    <SymbolPreview symbol={symbol} key={favoritesKey} />
                  </div>
                );
              }
            } else if (favoritesId.type === "paper-summary") {
              return (
                <div className="favorite">
                  <PaperSummary
                    paperId={favoritesId.entityId as string}
                    key={favoritesKey}
                  />
                </div>
              );
            }
            return null;
          });
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}
