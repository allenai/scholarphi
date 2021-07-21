import React from "react";
import {
  BoundingBox,
  isCitation,
  isSentence,
  SkimmingAnnotation,
} from "../../api/types";
import { Entities } from "../../state";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import HighlightMask from "./HighlightMask";
import FadePageMask from "./FadePageMask";
import PageMask from "./PageMask";

export type CuingStrategy = "highlight" | "declutter" | "fade";

interface Props {
  pageView: PDFPageView;
  entities: Entities;
  skimmingData: SkimmingAnnotation;
  opacity: number;
  cuingStrategy: CuingStrategy;
}

/**
 * Hides everything on a page that is not one of the selected entities.
 */
class SkimPageMask extends React.PureComponent<Props> {
  getFilteredBoundingBoxes = (
    ids: string[],
    entities: Entities,
    pageNumber: number
  ) => {
    return ids
      .map((id) => entities.byId[id])
      .filter((e) => isSentence(e))
      .filter((e) => e.attributes.bounding_boxes.length !== 0)
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);
  };

  render() {
    const {
      pageView,
      entities,
      skimmingData,
      opacity,
      cuingStrategy,
    } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    const citationBoxes = Object.values(entities.byId)
      .filter((e) => isCitation(e) && e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);
    const noShowBoxes = this.getFilteredBoundingBoxes(
      skimmingData.noShow,
      entities,
      pageNumber
    );

    let showBoxes: BoundingBox[] = [];
    let mask = null;
    if (cuingStrategy === "declutter") {
      const ids = [
        ...skimmingData.metadata,
        ...skimmingData.abstract,
        ...skimmingData.conclusion,
        ...skimmingData.sectionHeaders,
        ...skimmingData.subsectionHeaders,
        ...skimmingData.firstFigureCaption,
        ...skimmingData.captionFirstSentences,
        ...skimmingData.firstSentences,
      ];
      showBoxes = this.getFilteredBoundingBoxes(ids, entities, pageNumber);
      showBoxes = showBoxes.concat(skimmingData.manualBoxes);
      mask = (
        <PageMask
          pageView={pageView}
          show={showBoxes}
          noShow={noShowBoxes}
          opacity={opacity}
        />
      );
    } else if (cuingStrategy === "highlight") {
      showBoxes = this.getFilteredBoundingBoxes(
        skimmingData.firstSentences,
        entities,
        pageNumber
      );
      showBoxes = showBoxes.concat(
        skimmingData.manualBoxes.filter((b) => b.comment === "highlight-only")
      );
      mask = <HighlightMask pageView={pageView} show={showBoxes} />;
    } else if (cuingStrategy === "fade") {
      const opacityMultiplier = 0.1; // factor of opacity increase between sentences in a paragraph
      const metadataIds = [...skimmingData.metadata, ...skimmingData.abstract];
      const firstSentenceIds = [...skimmingData.firstSentences];
      const secondSentenceIds = firstSentenceIds
        .map((x) => (parseInt(x) + 1).toString())
        .filter((x) => !firstSentenceIds.includes(x));
      const thirdSentenceIds = secondSentenceIds
        .map((x) => (parseInt(x) + 1).toString())
        .filter((x) => !firstSentenceIds.includes(x))
        .filter((x) => !secondSentenceIds.includes(x));
      mask = (
        <FadePageMask
          pageView={pageView}
          show={this.getFilteredBoundingBoxes(
            metadataIds,
            entities,
            pageNumber
          )}
          fadeShow={[
            this.getFilteredBoundingBoxes(
              [...firstSentenceIds],
              entities,
              pageNumber
            ),
            this.getFilteredBoundingBoxes(
              [...secondSentenceIds],
              entities,
              pageNumber
            ),
            this.getFilteredBoundingBoxes(
              [...thirdSentenceIds],
              entities,
              pageNumber
            ),
          ]}
          opacity={0.5}
        />
      );
    }

    return <>{mask}</>;
  }
}

export default SkimPageMask;
