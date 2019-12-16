import Button from "@material-ui/core/Button";
import FeedbackButton from "./FeedbackButton";
import React from "react";
import PaperClipping from "./PaperClipping";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import { Symbol } from "./types/api";

interface SymbolTooltipBodyProps {
  symbol: Symbol;
}

export class SymbolTooltipBody extends React.Component<SymbolTooltipBodyProps> {
  render() {
    return (
      <div className="tooltip-body symbol-tooltip-body">
        <ScholarReaderContext.Consumer>
          {({
            symbols,
            mathMl,
            setDrawerState,
            setSelectedSymbol,
            setJumpSymbol
          }) => {
            const matches = selectors.matchingSymbols(
              this.props.symbol,
              [...symbols],
              [...mathMl]
            );
            const exactMatchSymbol = selectors.firstMatchingSymbol(
              this.props.symbol,
              [...symbols]
            );
            const nearMatchSymbol = selectors.firstMostSimilarSymbol(
              this.props.symbol,
              [...symbols],
              [...mathMl]
            );
            return (
              <>
                {exactMatchSymbol !== null && (
                  <>
                    <div className="tooltip-body__section tooltip-body__header">
                       <div className="tooltip-body__label">
                          This symbol is also mentioned at:
                        </div>
                       <FeedbackButton extraContext={{ symbolId: this.props.symbol.id }} />
                    </div>
                    <div className="tooltip-body__section">
                      <PaperClipping
                        pageNumber={exactMatchSymbol.bounding_box.page + 1}
                        highlightBoxes={[exactMatchSymbol.bounding_box]}
                      />
                    </div>
                  </>
                )}
                {exactMatchSymbol === null && nearMatchSymbol !== null && (
                  <>
                    <div className="tooltip-body__section tooltip-body__header">
                       <div className="tooltip-body__label">
                          A similar symbol is referenced at:
                        </div>
                       <FeedbackButton extraContext={{ symbolId: this.props.symbol.id }} />
                    </div>
                   <div className="tooltip-body__section">
                      <PaperClipping
                        pageNumber={nearMatchSymbol.bounding_box.page + 1}
                        highlightBoxes={[nearMatchSymbol.bounding_box]}
                      />
                    </div>
                  </>
                )}
                {exactMatchSymbol === null && nearMatchSymbol === null && (
                  <div className="tooltip-body__label tooltip-body__section">
                    This is the only place this symbol appears.
                  </div>
                )}
                {(exactMatchSymbol !== null || nearMatchSymbol !== null) && (
                  <div className="tooltip-body__action-buttons tooltip-body__section">
                    <Button
                      variant="outlined"
                      color="secondary"
                      className="tooltip-body__action-button"
                      onClick={() =>
                        setJumpSymbol(exactMatchSymbol || nearMatchSymbol)
                      }
                    >
                      Jump to Reference
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      className="tooltip-body__action-button"
                      onClick={() => {
                        setSelectedSymbol(this.props.symbol);
                        setDrawerState("show-symbols");
                      }}
                    >
                      View {matches.length} other References
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
