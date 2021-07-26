import React from "react";
import { DiscourseObj } from "./DiscourseTagMask";
import { BoundingBox } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

interface Props {
  pageView: PDFPageView;
  show?: BoundingBox[];
  discourseObjs?: DiscourseObj[];
}

/**
 * An overlay that highlights specific sections of a page.
 */
class HighlightMask extends React.PureComponent<Props> {
  render() {
    const { pageView, show, discourseObjs } = this.props;
    const { width, height } = uiUtils.getPageViewDimensions(pageView);
    const pageNumber = uiUtils.getPageNumber(pageView);

    return (
      <svg className="highlight-mask" width={width} height={height}>
        {show &&
          show
            .filter((b) => b.page === pageNumber)
            .map((b, i) => (
              <React.Fragment key={`highlight-${i}`}>
                <rect
                  className="highlight-mask__highlight"
                  x={b.left * width}
                  y={b.top * height}
                  width={b.width * width}
                  height={b.height * height}
                />
              </React.Fragment>
            ))}
        {discourseObjs &&
          discourseObjs.map((d, i) =>
            d.entity.attributes.bounding_boxes.map((b, j) => (
              <React.Fragment key={`highlight-${i}-${j}`}>
                <rect
                  className={`highlight-mask__highlight highlight-${d.id}`}
                  x={b.left * width}
                  y={b.top * height}
                  width={b.width * width}
                  height={b.height * height}
                  style={{ fill: d.color, opacity: 0.5 }}
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
