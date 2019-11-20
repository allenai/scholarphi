import Button from "@material-ui/core/Button";
import React from "react";
import { PaperClipping } from "./PaperClipping";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import { Symbol } from "./types/api";
import { PDFViewer } from "./types/pdfjs-viewer";

interface SymbolTooltipBodyProps {
  symbol: Symbol;
}

interface SymbolTooltipBodyState {
  activeSymbol?: Symbol;
  activeSymbolIndex: number;
}

function scrollToSymbol(pdfViewer: PDFViewer, symbol: Symbol) {
  /*
   * Based roughly on the scroll offsets used for pdf.js "find" functionality:
   * https://github.com/mozilla/pdf.js/blob/16ae7c6960c1296370c1600312f283a68e82b137/web/pdf_find_controller.js#L190-L191
   * TODO(andrewhead): this offset should be in viewport coordinates, not PDF coordinates.
   */
  const SCROLL_OFFSET_X = -400;
  const SCROLL_OFFSET_Y = +100;

  const box = symbol.bounding_box;
  pdfViewer.scrollPageIntoView({
    pageNumber: box.page + 1,
    destArray: [
      undefined,
      { name: "XYZ" },
      box.left + SCROLL_OFFSET_X,
      box.top + SCROLL_OFFSET_Y
    ]
  });
}

export class SymbolTooltipBody extends React.Component<
  SymbolTooltipBodyProps,
  SymbolTooltipBodyState
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  constructor(props: SymbolTooltipBodyProps) {
    super(props);
    this.state = {
      activeSymbolIndex: 0
    };
  }

  previousSymbol(symbols: Symbol[]) {
    const activeSymbolIndex =
      (this.state.activeSymbolIndex - 1) % symbols.length;
    this.setState({
      activeSymbolIndex,
      activeSymbol: symbols[activeSymbolIndex]
    });
  }

  nextSymbol(symbols: Symbol[]) {
    const activeSymbolIndex =
      (this.state.activeSymbolIndex + 1) % symbols.length;
    this.setState({
      activeSymbolIndex,
      activeSymbol: symbols[activeSymbolIndex]
    });
  }

  render() {
    const matchingSymbols = selectors.getMatchingSymbols(
      [...this.context.symbols],
      this.props.symbol
    );

    return (
      <div className="symbol-tooltip-body">
        {matchingSymbols.map((symbol, i) => {
          const { bounding_box } = symbol;
          const hidden = i !== this.state.activeSymbolIndex;
          return (
            <div key={symbol.id} hidden={hidden}>
              {/* Only render if the symbol is not hidden. */}
              {hidden === false && (
                <PaperClipping
                  pageNumber={bounding_box.page + 1}
                  highlightBoxes={[bounding_box]}
                />
              )}
            </div>
          );
        })}
        <Button onClick={() => this.previousSymbol(matchingSymbols)}>
          Previous
        </Button>
        <ScholarReaderContext.Consumer>
          {({ pdfViewer }) => (
            <Button
              onClick={() => {
                const { activeSymbol } = this.state;
                if (activeSymbol !== undefined && pdfViewer !== null) {
                  scrollToSymbol(pdfViewer, activeSymbol);
                }
              }}
            >
              Jump to this location
            </Button>
          )}
        </ScholarReaderContext.Consumer>
        <Button onClick={() => this.nextSymbol(matchingSymbols)}>Next</Button>
      </div>
    );
  }
}

export default SymbolTooltipBody;
