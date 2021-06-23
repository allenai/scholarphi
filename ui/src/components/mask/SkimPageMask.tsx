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
import PageMask from "./PageMask";

export type CuingStrategy = "highlight" | "declutter";

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
  render() {
    const {
      pageView,
      entities,
      skimmingData,
      opacity,
      cuingStrategy,
    } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    const sentences = Object.fromEntries(
      Object.entries(entities.byId).filter(
        ([id, e], _) =>
          isSentence(e) && e.attributes.bounding_boxes.length !== 0
      )
    );

    const citationBoxes = Object.values(entities.byId)
      .filter((e) => isCitation(e) && e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);
    const noShowBoxes = skimmingData.noShow
      .map((id) => sentences[id])
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber)
      .concat(citationBoxes);

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
      showBoxes = ids
        .map((id) => sentences[id])
        .filter((e) => e !== undefined)
        .map((e) => e.attributes.bounding_boxes)
        .flat()
        .filter((b) => b.page === pageNumber);
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
      showBoxes = skimmingData.firstSentences
        .map((id) => sentences[id])
        .filter((e) => e !== undefined)
        .map((e) => e.attributes.bounding_boxes)
        .flat()
        .filter((b) => b.page === pageNumber);
      mask = <HighlightMask pageView={pageView} show={showBoxes} />;
    }

    return <>{mask}</>;
  }
}

export default SkimPageMask;
