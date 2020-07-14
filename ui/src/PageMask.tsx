import React from "react";
import * as selectors from "./selectors";
import { Entities } from "./state";
import { isSentence, isSymbol, Sentence, Symbol } from "./types/api";

interface Props {
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
  entities: Entities | null;
  selectedEntityId: string | null;
}

export class PageMask extends React.PureComponent<Props> {
  render() {
    /*
     * Only show the mask if a symbol is selected and sentences were detected for the paper.
     */
    const { selectedEntityId, entities } = this.props;
    if (entities === null || selectedEntityId === null) {
      return null;
    }
    const selectedEntity = entities.byId[selectedEntityId];
    if (!isSymbol(selectedEntity)) {
      return null;
    }

    const matchingSentenceIds: string[] = [];
    selectors
      .matchingSymbols(selectedEntityId, entities)
      .forEach((matchingSymbolId) => {
        const sentenceId = (entities.byId[matchingSymbolId] as Symbol)
          .relationships.sentence.id;
        if (
          sentenceId !== null &&
          matchingSentenceIds.indexOf(sentenceId) === -1
        ) {
          matchingSentenceIds.push(sentenceId);
        }
      });
    const matchingSentences = matchingSentenceIds
      .map((sentenceId) => entities.byId[sentenceId])
      .filter((s) => s !== undefined)
      .filter(isSentence);
    const firstMatchingSentence:
      | Sentence
      | undefined = matchingSentences[0] as Sentence;

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
                    key={`${s.id}-box${i}`}
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
          opacity={0.5}
          mask={`url(#${maskId})`}
        />
        {/* Highlight the first sentence in the document where the symbol appears. */}
        {firstMatchingSentence !== undefined && (
          <>
            {firstMatchingSentence.attributes.bounding_boxes
              .filter((b) => b.page === this.props.pageNumber - 1)
              .map((b, i) => (
                <rect
                  key={`${firstMatchingSentence.id}-box${i}`}
                  x={b.left * pageWidth}
                  y={b.top * pageHeight}
                  width={b.width * pageWidth}
                  height={b.height * pageHeight}
                  fill="green"
                  opacity={0.2}
                />
              ))}
          </>
        )}
      </svg>
    );
  }
}

export default PageMask;
