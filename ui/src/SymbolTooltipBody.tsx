import Button from "@material-ui/core/Button";
import React from "react";
import FeedbackButton from "./FeedbackButton";
import PaperClipping from "./PaperClipping";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import { Symbol } from "./types/api";

interface SymbolTooltipBodyProps {
  symbol: Symbol;
}

export class SymbolTooltipBody extends React.PureComponent<
  SymbolTooltipBodyProps
> {
  render() {
    return (
      <div className="tooltip-body symbol-tooltip-body">
        <ScholarReaderContext.Consumer>
          {({
            setDrawerState,
            symbols,
            mathMls,
            setSelectedEntity,
            selectAnnotationForEntity
          }) => {
            if (symbols === null || mathMls === null) {
              return (
                <div className="tooltip-body__section tooltip-body__header">
                  <div className="tooltip-body__label">
                    Something unexpected happened and information for this
                    symbol cannot be looked up. Please help us fix this issue by
                    clicking on the feedback button below.
                  </div>
                  <FeedbackButton
                    extraContext={{ symbolId: this.props.symbol.id }}
                  />
                </div>
              );
            }

            let exactMatchSymbolId: string | undefined;
            let partialMatchSymbolId: string | undefined;

            /*
             * If an exact match could not be found, attempt to find the first partially-
             * matching symbol in the paper.
             */
            const partialMatchSymbolIds = selectors.matchingSymbols(
              this.props.symbol.id,
              symbols,
              mathMls,
              false
            );
            if (partialMatchSymbolIds.length > 0) {
              partialMatchSymbolId = selectors.orderByPosition(
                partialMatchSymbolIds,
                symbols
              )[0];
            }

            /*
             * Attempt to find first exactly-matching symbol.
             */
            const exactMatchSymbolIds = selectors.matchingSymbols(
              this.props.symbol.id,
              symbols,
              mathMls,
              true
            );
            if (exactMatchSymbolIds.length > 0) {
              exactMatchSymbolId = selectors.orderByPosition(
                exactMatchSymbolIds,
                symbols
              )[0];
            }

            return (
              <>
                {(() => {
                  if (exactMatchSymbolId === undefined) {
                    return null;
                  }
                  const matchingSymbol = symbols.byId[exactMatchSymbolId];
                  return (
                    <div className="tooltip-body__section">
                      <PaperClipping
                        pageNumber={matchingSymbol.bounding_boxes[0].page + 1}
                        sentenceId={matchingSymbol.sentence || undefined}
                        highlights={matchingSymbol.bounding_boxes.slice(0, 1)}
                      />
                      <FeedbackButton
                        extraContext={{ symbolId: this.props.symbol.id }}
                      />
                    </div>
                  );
                })()}
                {exactMatchSymbolId === undefined && (
                  <div className="tooltip-body__label tooltip-body__section">
                    This is the only place this symbol appears.
                  </div>
                )}
                {(exactMatchSymbolId !== undefined ||
                  partialMatchSymbolId !== undefined) && (
                  <div className="tooltip-body__action-buttons tooltip-body__section">
                    <Button
                      variant="outlined"
                      color="secondary"
                      className="tooltip-body__action-button"
                      onClick={() => {
                        const matchingSymbolId =
                          exactMatchSymbolId || partialMatchSymbolId;
                        if (matchingSymbolId !== undefined) {
                          setSelectedEntity(matchingSymbolId, "symbol");
                          selectAnnotationForEntity(matchingSymbolId, "symbol");
                        }
                      }}
                    >
                      Jump to reference
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      className="tooltip-body__action-button"
                      onClick={() => {
                        setDrawerState("open");
                      }}
                    >
                      View {partialMatchSymbolIds.length} similar references
                    </Button>
                  </div>
                )}
              </>
            );
          }}
        </ScholarReaderContext.Consumer>
      </div>
    );
  }
}

export default SymbolTooltipBody;
