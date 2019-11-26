import Button from "@material-ui/core/Button";
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
            setOpenDrawer,
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
                    <div className="tooltip-body__label tooltip-body__section">
                      This symbol is also mentioned at:
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
                    <div className="tooltip-body__label tooltip-body__section">
                      A similar symbol is referenced at:
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
                    This is the first place this symbol has appeared.
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
                        setOpenDrawer(true);
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
