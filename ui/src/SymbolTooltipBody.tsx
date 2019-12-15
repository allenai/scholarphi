import Button from "@material-ui/core/Button";
import React from "react";
import PaperClipping from "./PaperClipping";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import { Symbol, MathMl } from "./types/api";

interface SymbolTooltipBodyProps {
  symbol: Symbol;
  symbols: Symbol[];
  mathMl: MathMl[];
  setHighlightedSymbols: (symbolIds: Set<number>) => void;
  clearHighlightedSymbols: () => void;
}

interface SymbolTooltipBodyState {
  matchLength: number;
}

export class SymbolTooltipBody extends React.Component<
  SymbolTooltipBodyProps, 
  SymbolTooltipBodyState
> {
  constructor(props: SymbolTooltipBodyProps) {
    super(props);
    this.state = { 
      matchLength: 0,
    }
  }

  componentDidMount() {
    const { 
      symbol,
      mathMl, 
      symbols, 
      setHighlightedSymbols 
    } = this.props;
    const highlightedSymbols = selectors.matchingSymbolIds(symbol, symbols, mathMl);
    setHighlightedSymbols(highlightedSymbols.add(symbol.id));
    this.setState({ matchLength: highlightedSymbols.size-1 }) // -1 for the id of this symbol
  }

  componentWillUnmount() {
    this.props.clearHighlightedSymbols();
  }

  render() {
    return (
      <div className="tooltip-body symbol-tooltip-body">
        <ScholarReaderContext.Consumer>
          {({
            setDrawerState,
            setJumpSymbol,
            setSelectedSymbol, 
          }) => {
            const exactMatchSymbol = selectors.firstMatchingSymbol(
              this.props.symbol,
              this.props.symbols
            );
            const nearMatchSymbol = selectors.firstMostSimilarSymbol(
              this.props.symbol,
              this.props.symbols,
              this.props.mathMl,
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
                      View {this.state.matchLength} other References
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
