import React from "react";
import PageMask from "./PageMask";
import * as selectors from "./selectors";
import { Entities } from "./state";
import { BoundingBox } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

interface Props {
  pageView: PDFPageView;
  entities: Entities | null;
  firstMatchingEntityId: string | null;
  matchingEntityIds: string[];
}

/**
 * A mask that appears over the page during search to hide irrelevant content.
 */
export class SearchPageMask extends React.PureComponent<Props> {
  render() {
    /*
     * Show the sentences containing all matching symbols.
     */
    const { matchingEntityIds, firstMatchingEntityId, entities } = this.props;
    if (entities === null) {
      return null;
    }
    const sentencesToShow = selectors.symbolSentences(
      matchingEntityIds,
      entities
    );
    const pageNumber = uiUtils.getPageNumber(this.props.pageView);
    const show = sentencesToShow
      .map((s) => s.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);

    /*
     * Highlight a sentence that contains the first matching symbol.
     */
    let highlight: BoundingBox[] = [];
    if (firstMatchingEntityId !== null) {
      const firstMatchingSentence = selectors.symbolSentences(
        [firstMatchingEntityId],
        entities
      )[0];
      if (firstMatchingSentence !== undefined) {
        highlight = firstMatchingSentence.attributes.bounding_boxes;
      }
    }

    /*
     * Place a label right below the last bounding box of the highlight.
     */
    const lastHighlight = highlight[highlight.length - 1];
    const LABEL_PADDING_TOP = 12;
    const { width, height } = uiUtils.getPageViewDimensions(
      this.props.pageView
    );

    return (
      <PageMask
        pageView={this.props.pageView}
        show={show}
        highlight={highlight}
      >
        {lastHighlight !== undefined ? (
          <>
            <rect
              className="page-mask__highlight-label__background"
              x={lastHighlight.left * width}
              y={
                (lastHighlight.top + lastHighlight.height) * height +
                LABEL_PADDING_TOP
              }
              /*
               * XXX(andrewhead): set to correspond to the width and height of the label given what
               * was known at the time about its font family and font size. If the font family or size
               * of the text changes, this width and height will need to as well.
               */
              width={210}
              height={25}
            />
            <text
              className="page-mask__highlight-label"
              x={lastHighlight.left * width + 6}
              y={
                (lastHighlight.top + lastHighlight.height) * height +
                LABEL_PADDING_TOP +
                6
              }
              dominantBaseline="hanging"
            >
              First appearance of symbol
            </text>
          </>
        ) : null}
      </PageMask>
    );
  }
}

export default SearchPageMask;
