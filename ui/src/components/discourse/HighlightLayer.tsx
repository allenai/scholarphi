import React from "react";
import { DiscourseObj } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import HighlightMask from "../mask/HighlightMask";

interface Props {
  pageView: PDFPageView;
  discourseObjs: DiscourseObj[];
  opacity: number;
}

/**
 * Declutter relevant sentences and add discourse tag in margin for each sentence.
 */
class HighlightLayer extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, discourseObjs, opacity } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    const filterDiscourseObjs = discourseObjs.filter(
      (d) => d.tagLocation.page === pageNumber
    );

    return (
      <>
        <HighlightMask
          pageView={pageView}
          discourseObjs={filterDiscourseObjs}
          opacity={opacity}
        />
      </>
    );
  }
}

export default HighlightLayer;
