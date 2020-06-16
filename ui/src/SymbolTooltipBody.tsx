import Button from "@material-ui/core/Button";
import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import FeedbackButton from "./FeedbackButton";
import PaperClipping from "./PaperClipping";
import * as selectors from "./selectors";
import { MathMls, PaperId, Sentences, Symbols } from "./state";
import { Symbol } from "./types/api";

interface SymbolTooltipBodyProps {
  paperId: PaperId;
  pdfDocument: PDFDocumentProxy;
  symbols: Symbols;
  mathMls: MathMls;
  sentences: Sentences | null;
  symbol: Symbol;
  handleOpenDrawer: () => void;
  handleSelectSymbol: (id: string) => void;
}

export class SymbolTooltipBody extends React.PureComponent<
  SymbolTooltipBodyProps
> {
  onClickJumpButton(symbolId: string | undefined) {
    if (symbolId !== undefined) {
      this.props.handleSelectSymbol(symbolId);
    }
  }

  onClickSearchButton() {
    this.props.handleOpenDrawer();
  }

  render() {
    const { symbols, mathMls } = this.props;

    let exactMatchSymbolId: string | undefined;
    let partialMatchSymbolId: string | undefined;

    /*
     * If an exact match could not be found, attempt to find the first partially-
     * matching symbol in the paper.
     */
    const partialMatchSymbolIds = selectors.matchingSymbols(
      this.props.symbol.id,
      symbols,
      mathMls
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
      mathMls
    );
    if (exactMatchSymbolIds.length > 0) {
      exactMatchSymbolId = selectors.orderByPosition(
        exactMatchSymbolIds,
        symbols
      )[0];
    }

    return (
      <div className="tooltip-body symbol-tooltip-body">
        <>
          {(() => {
            if (exactMatchSymbolId === undefined) {
              return null;
            }
            const matchingSymbol = symbols.byId[exactMatchSymbolId];
            return (
              <div className="tooltip-body__section">
                <PaperClipping
                  pdfDocument={this.props.pdfDocument}
                  sentences={this.props.sentences}
                  pageNumber={matchingSymbol.bounding_boxes[0].page + 1}
                  sentenceId={matchingSymbol.sentence || undefined}
                  highlights={matchingSymbol.bounding_boxes.slice(0, 1)}
                />
                <FeedbackButton
                  paperId={this.props.paperId}
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
                onClick={this.onClickJumpButton.bind(
                  this,
                  exactMatchSymbolId || partialMatchSymbolId
                )}
              >
                Jump to reference
              </Button>
              <Button
                variant="outlined"
                color="primary"
                className="tooltip-body__action-button"
                onClick={this.props.handleOpenDrawer.bind(this)}
              >
                View {partialMatchSymbolIds.length} similar references
              </Button>
            </div>
          )}
        </>
      </div>
    );
  }
}

export default SymbolTooltipBody;
