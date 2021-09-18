import React from "react";
import { BoundingBox, DiscourseObj, SentenceUnit } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

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
    const { width, height } = uiUtils.getPageViewDimensions(pageView);

    const filteredDiscourseObjs = discourseObjs.filter(
      (d) => d.tagLocation.page === pageNumber
    );

    const filteredLeadSentences = leadSentences.filter((s) =>
      s.bboxes.every((b: BoundingBox) => b.page === pageNumber)
    );

    return (
      <>
        {filteredDiscourseObjs &&
          filteredDiscourseObjs.map((d, i) =>
            d.bboxes.map((b, j) => (
              <React.Fragment key={`highlight-${i}-${j}`}>
                <div
                  className={`highlight-mask__highlight highlight-${d.id}`}
                  style={{
                    position: "absolute",
                    left: b.left * width,
                    top: b.top * height,
                    width: b.width * width,
                    height: b.height * height,
                    backgroundColor: d.color,
                    opacity: opacity,
                  }}
                />
              </React.Fragment>
            ))
          )}
        {filteredLeadSentences &&
          filteredLeadSentences.map((s, i) =>
            s.bboxes.map((b, j) => (
              <React.Fragment key={`highlight-${i}-${j}`}>
                <div
                  className={`highlight-mask__highlight highlight-${i}`}
                  style={{
                    position: "absolute",
                    left: b.left * width,
                    top: b.top * height,
                    width: b.width * width,
                    height: b.height * height,
                    backgroundColor: "#F1E740",
                    opacity: 0.25,
                  }}
                />
              </React.Fragment>
            ))
          )}
      </>
    );
  }
}

export default HighlightLayer;
