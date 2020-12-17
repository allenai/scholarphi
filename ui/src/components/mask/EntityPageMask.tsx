import PageMask from "./PageMask";
import { Entities } from "../../state";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

import React from "react";

interface Props {
  pageView: PDFPageView;
  entities: Entities;
  selectedEntityIds: string[];
}

/**
 * Hides everything on a page that is not one of the selected entities.
 */
class EntityPageMask extends React.PureComponent<Props> {
  render() {
    const { pageView, entities, selectedEntityIds } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);
    const show = selectedEntityIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .map((e) => e.attributes.bounding_boxes)
      .flat()
      .filter((b) => b.page === pageNumber);
    return <PageMask pageView={pageView} show={show} />;
  }
}

export default EntityPageMask;
