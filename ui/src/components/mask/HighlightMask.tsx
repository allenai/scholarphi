import React from "react";
import { BoundingBox } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

interface Props {
  pageView: PDFPageView;
  show: BoundingBox[];
}

/**
 * An overlay that highlights specific sections of a page.
 */
class HighlightMask extends React.PureComponent<Props> {
  render() {
    const { pageView, show } = this.props;
    const { width, height } = uiUtils.getPageViewDimensions(pageView);
    const pageNumber = uiUtils.getPageNumber(pageView);

    return (
      <svg className="highlight-mask" width={width} height={height}>
        {show
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
        {this.props.children}
      </svg>
    );
  }
}

export default HighlightMask;
