import Button from "@material-ui/core/Button";
import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import FeedbackButton from "./FeedbackButton";
import PaperClipping from "./PaperClipping";
import * as selectors from "./selectors";
import { Entities, PaperId } from "./state";
import { Symbol } from "./types/api";

interface Props {
  paperId: PaperId;
  pdfDocument: PDFDocumentProxy;
  entities: Entities;
  symbol: Symbol;
  handleOpenDrawer: () => void;
  handleSelectSymbol: (id: string) => void;
}

export class SymbolPreviewGloss extends React.PureComponent<Props> {
  onClickJumpButton(symbolId: string | undefined) {
    if (symbolId !== undefined) {
      this.props.handleSelectSymbol(symbolId);
    }
  }

  onClickSearchButton() {
    this.props.handleOpenDrawer();
  }

  render() {
    const { symbol, entities } = this.props;

    let exactMatchSymbolId: string | undefined;
    let partialMatchSymbolId: string | undefined;

    /*
     * If an exact match could not be found, attempt to find the first partially-
     * matching symbol in the paper.
     */
    const partialMatchSymbolIds = selectors.matchingSymbols(
      this.props.symbol.id,
      entities
    );
    if (partialMatchSymbolIds.length > 0) {
      partialMatchSymbolId = selectors.orderByPosition(
        partialMatchSymbolIds,
        entities
      )[0];
    }

    /*
     * Attempt to find first exactly-matching symbol.
     */
    const exactMatchSymbolIds = selectors.matchingSymbols(
      this.props.symbol.id,
      entities
    );
    if (exactMatchSymbolIds.length > 0) {
      exactMatchSymbolId = selectors.orderByPosition(
        exactMatchSymbolIds,
        entities
      )[0];
    }

    const sentence = selectors.symbolSentence(symbol.id, entities);

    return (
      <div className="gloss symbol-gloss">
        <>
          {(() => {
            if (exactMatchSymbolId === undefined) {
              return null;
            }
            const matchingSymbol = entities.byId[exactMatchSymbolId];
            return (
              <div className="gloss__section">
                <PaperClipping
                  pdfDocument={this.props.pdfDocument}
                  sentence={sentence}
                  pageNumber={
                    matchingSymbol.attributes.bounding_boxes[0].page + 1
                  }
                  highlights={matchingSymbol.attributes.bounding_boxes.slice(
                    0,
                    1
                  )}
                />
                <FeedbackButton
                  paperId={this.props.paperId}
                  extraContext={{ symbolId: symbol.id }}
                />
              </div>
            );
          })()}
          {exactMatchSymbolId === undefined && (
            <div className="gloss__label gloss__section">
              This is the only place this symbol appears.
            </div>
          )}
          {(exactMatchSymbolId !== undefined ||
            partialMatchSymbolId !== undefined) && (
            <div className="gloss__action-buttons gloss__section">
              <Button
                variant="outlined"
                color="secondary"
                className="gloss__action-button"
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
                className="gloss__action-button"
                onClick={this.props.handleOpenDrawer}
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

export default SymbolPreviewGloss;
