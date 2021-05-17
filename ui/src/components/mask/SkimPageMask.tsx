import React from "react";
import { isCitation, isSentence, SkimmingAnnotation } from "../../api/types";
import { Entities } from "../../state";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import PageMask from "./PageMask";

interface Props {
  pageView: PDFPageView;
  entities: Entities;
  skimmingData: SkimmingAnnotation;
}

/**
 * Hides everything on a page that is not one of the selected entities.
 */
class SkimPageMask extends React.PureComponent<Props> {
  render() {
    const { pageView, entities, skimmingData } = this.props;
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

    const firstLevelHighlightIds = [
      ...skimmingData.metadata,
      ...skimmingData.abstract,
      ...skimmingData.conclusion,
      ...skimmingData.sectionHeaders,
      ...skimmingData.subsectionHeaders,
      ...skimmingData.firstFigureCaption,
      ...skimmingData.captionFirstSentences,
      ...skimmingData.firstSentences,
    ];
    let showBoxes = firstLevelHighlightIds
      .map((id) => sentences[id])
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);

    showBoxes = showBoxes.concat(skimmingData.manualBoxes);

    return (
      <PageMask pageView={pageView} show={showBoxes} noShow={noShowBoxes} />
    );
  }
}

export default SkimPageMask;
