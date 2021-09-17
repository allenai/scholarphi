import React from "react";
import { BoundingBox, DiscourseObj, SentenceUnit } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import HighlightMask from "../mask/HighlightMask";

interface Props {
  pageView: PDFPageView;
  discourseObjs: DiscourseObj[];
  leadSentences: SentenceUnit[];
  opacity: number;
}

class HighlightLayer extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { pageView, discourseObjs, leadSentences, opacity } = this.props;
    const pageNumber = uiUtils.getPageNumber(pageView);

    const filteredDiscourseObjs = discourseObjs.filter(
      (d) => d.tagLocation.page === pageNumber
    );

    const filteredLeadSentences = leadSentences.filter((s) =>
      s.bboxes.every((b: BoundingBox) => b.page === pageNumber)
    );

    return (
      <>
        <HighlightMask
          pageView={pageView}
          discourseObjs={filteredDiscourseObjs}
          leadSentences={filteredLeadSentences}
          opacity={opacity}
        />
      </>
    );
  }
}

export default HighlightLayer;
