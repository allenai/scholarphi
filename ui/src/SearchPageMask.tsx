import React from "react";
import PageMask from "./PageMask";
import * as selectors from "./selectors";
import { Entities } from "./state";
import { isSentence, isSymbol, Sentence, Symbol } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

interface Props {
  pageView: PDFPageView;
  entities: Entities | null;
  selectedEntityIds: string[];
}

/**
 * A mask that appears over the page during search to hide irrelevant content.
 */
export class SearchPageMask extends React.PureComponent<Props> {
  render() {
    /*
     * Only show the mask if a symbol is selected and sentences were detected for the paper.
     */
    const { selectedEntityIds, entities } = this.props;
    if (entities === null) {
      return null;
    }
    const selectedSymbolIds = selectedEntityIds.filter((entityId) =>
      isSymbol(entities.byId[entityId])
    );
    if (selectedSymbolIds.length === 0) {
      return null;
    }

    const matchingSentences: Sentence[] = [];
    const firstMatchingSentences: Sentence[] = [];
    selectedSymbolIds.forEach((symbolId) => {
      let foundFirstSentenceForSymbol = false;
      selectors.matchingSymbols(symbolId, entities).forEach((matchId) => {
        const sentenceId = (entities.byId[matchId] as Symbol).relationships
          .sentence.id;
        if (
          sentenceId !== null &&
          !matchingSentences.some((s) => s.id === sentenceId)
        ) {
          const sentence = entities.byId[sentenceId];
          if (sentence !== undefined && isSentence(sentence)) {
            matchingSentences.push(sentence);
            if (!foundFirstSentenceForSymbol) {
              if (!firstMatchingSentences.some((s) => s.id === sentence.id)) {
                firstMatchingSentences.push(sentence);
              }
              foundFirstSentenceForSymbol = true;
            }
          }
        }
      });
    });

    const pageNumber = uiUtils.getPageNumber(this.props.pageView);
    const show = matchingSentences
      .map((s) => s.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);
    const highlight = firstMatchingSentences
      .map((s) => s.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);

    return (
      <PageMask
        pageView={this.props.pageView}
        show={show}
        highlight={highlight}
      />
    );
  }
}

export default SearchPageMask;
