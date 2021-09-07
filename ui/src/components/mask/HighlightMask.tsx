import React from "react";
import { DiscourseObj } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

interface Props {
  pageView: PDFPageView;
  discourseObjs?: DiscourseObj[];
  opacity: number;
}

/**
 * An overlay that highlights specific sections of a page.
 */
class HighlightMask extends React.PureComponent<Props> {
  render() {
    const { pageView, discourseObjs, opacity } = this.props;
    const { width, height } = uiUtils.getPageViewDimensions(pageView);

    return (
      <svg className="highlight-mask" width={width} height={height}>
        {discourseObjs &&
          discourseObjs.map((d, i) =>
            d.bboxes.map((b, j) => (
              <React.Fragment key={`highlight-${i}-${j}`}>
                <rect
                  className={`highlight-mask__highlight highlight-${d.id}`}
                  x={b.left * width}
                  y={b.top * height}
                  width={b.width * width}
                  height={b.height * height}
                  style={{ fill: d.color, opacity: opacity }}
                />
              </React.Fragment>
            ))
          )}
        {this.props.children}
      </svg>
    );
  }
}

export default HighlightMask;
