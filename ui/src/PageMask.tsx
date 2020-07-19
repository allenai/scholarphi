import React from "react";
import * as selectors from "./selectors";
import { Entities } from "./state";
import { isSentence, isSymbol, Sentence, Symbol } from "./types/api";

interface Props {
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
  entities: Entities | null;
  selectedEntityIds: string[];
}

export class PageMask extends React.PureComponent<Props> {
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

    const maskId = `page-${this.props.pageNumber}-mask`;
    const { pageWidth, pageHeight } = this.props;
    return (
      <svg width={pageWidth} height={pageHeight}>
        <mask id={maskId}>
          {/*
           * Where the SVG mask is white, the overlay mask will show. Start by showing the
           * mask everywhere, and subtract from it. Setting the fill to "white" sets the
           * initial mask area as the entire page. Setting the fill to "black" (as with the
           * rectangles below) subtracts from the mask.
           */}
          <rect
            key="entire-page-mask"
            width={pageWidth}
            height={pageHeight}
            fill="white"
          />
          {/*
           * Subtract from the mask wherever a sentence should be activated.
           */}
          {matchingSentences
            .map((s) => {
              return s.attributes.bounding_boxes
                .filter((b) => b.page === this.props.pageNumber - 1)
                .map((b, i) => (
                  <rect
                    key={`sentence-${s.id}-box${i}`}
                    x={b.left * pageWidth}
                    y={b.top * pageHeight}
                    width={b.width * pageWidth}
                    height={b.height * pageHeight}
                    fill="black"
                  />
                ));
            })
            /*
             * Flatten all masks generated for each bounding box into single list.
             */
            .flat()}
        </mask>
        {/* Show a white mask the page anywhere a sentence rectangle wasn't added above. */}
        <rect
          key="white-overlay"
          width={pageWidth}
          height={pageHeight}
          fill={"white"}
          opacity={0.4}
          mask={`url(#${maskId})`}
        />
        {/* Highlight the first sentence in the document where the symbol appears. */}
        {firstMatchingSentences
          .map((s) =>
            s.attributes.bounding_boxes
              .filter((b) => b.page === this.props.pageNumber - 1)
              .map((b, i) => (
                <rect
                  key={`definition-sentence-${s.id}-box${i}`}
                  x={b.left * pageWidth}
                  y={b.top * pageHeight}
                  width={b.width * pageWidth}
                  height={b.height * pageHeight}
                  fill="green"
                  opacity={0.2}
                />
              ))
          )
          .flat()}
      </svg>
    );
  }
}

export default PageMask;
