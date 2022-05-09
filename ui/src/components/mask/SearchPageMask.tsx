import React from "react";
import * as selectors from "../../selectors";
import { Entities } from "../../state";
import { BoundingBox } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

import PageMask from "./PageMask";

interface Props {
  pageView: PDFPageView;
  entities: Entities | null;
  firstMatchingEntityId: string | null;
  matchingEntityIds: string[];
  highlightFirstMatch?: boolean;
  highlightDefinitions?: boolean;
}

/**
 * A mask that appears over the page during search to hide irrelevant content.
 */
export class SearchPageMask extends React.PureComponent<Props> {
  render() {
    /*
     * Show the sentences containing all matching symbols.
     */
    const {
      matchingEntityIds,
      entities,
      highlightFirstMatch,
      highlightDefinitions,
    } = this.props;
    if (entities === null) {
      return null;
    }
    const sentencesToShow = selectors.sentences(matchingEntityIds, entities);

    const pageNumber = uiUtils.getPageNumber(this.props.pageView);
    const show = sentencesToShow
      .map((s) => s.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);

    /*
     * Highlight sentences that contain definition information.
     */
    let highlight: BoundingBox[] = [];
    if (highlightDefinitions) {
      const highlights = selectors
        .definingSentences(matchingEntityIds, entities)
        .map((e) => e.attributes.bounding_boxes)
        .flat()
        .reduce((boxes, b) => {
          boxes[`${b.page}-${b.left}-${b.top}-${b.width}-${b.height}`] = b;
          return boxes;
        }, {} as { [boxKey: string]: BoundingBox });
      highlight = Object.values(highlights);
    }

    /*
     * Place a label right below the last bounding box of the highlight.
     */
    let firstHighlight;
    if (highlightFirstMatch) {
      firstHighlight = highlight[0];
    }

    const { width, height } = uiUtils.getPageViewDimensions(
      this.props.pageView
    );

    const LABEL_MARGIN_BOTTOM = 6;
    /*
     * XXX(andrewhead): set to correspond to the width and height of the label given what
     * was known at the time about its font family and font size. If the font family or size
     * of the text changes, this width and height will need to as well.
     */
    const EXPECTED_LABEL_WIDTH = 210;
    const EXPECTED_LABEL_HEIGHT = 25;

    return null;
    return (
      <PageMask
        pageView={this.props.pageView}
        show={show}
        highlight={highlight}
      >
        {firstHighlight !== undefined ? (
          <>
            <rect
              className="page-mask__highlight-label__background"
              x={firstHighlight.left * width}
              y={
                firstHighlight.top * height -
                LABEL_MARGIN_BOTTOM -
                EXPECTED_LABEL_HEIGHT
              }
              width={EXPECTED_LABEL_WIDTH}
              height={EXPECTED_LABEL_HEIGHT}
            />
            <text
              className="page-mask__highlight-label"
              x={firstHighlight.left * width + 6}
              y={firstHighlight.top * height - LABEL_MARGIN_BOTTOM - 6}
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
