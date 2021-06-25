import React from "react";
import { BoundingBox } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";


interface Props {
  pageView: PDFPageView;
  show: BoundingBox[];
  fadeShow: BoundingBox[][];
  opacity: number;
}

/**
 * A mask overlaid on a page of a PDF that shows some of the content and hides the rest.
 * Content can be displayed with a fading effect, decreasing opacity across groups in fadeShow.
 */
class FadePageMask extends React.PureComponent<Props> {
  public static defaultProps = {
    opacity: 0.6,
  };

  render() {
    const { pageView, show, fadeShow, opacity } = this.props;
    const { width, height } = uiUtils.getPageViewDimensions(pageView);
    const pageNumber = uiUtils.getPageNumber(pageView);

    const maskId = `page-${pageNumber}-mask`;
    return (
      <svg className="page-mask" width={width} height={height}>
        <mask id={maskId}>
          <rect
            key="entire-page-mask"
            width={width}
            height={height}
            fill="white"
          />
          {fadeShow.map((boxGrp, gi) =>
            boxGrp
              .filter((b) => b.page === pageNumber)
              .map((box, bi) => (
                <rect
                  key={`group${gi}-box${bi}`}
                  x={box.left * width}
                  y={box.top * height}
                  width={box.width * width}
                  height={box.height * height}
                  fill="black"
                />
              ))
          )}
          {show
            .filter((b) => b.page === pageNumber)
            .map((box, bi) => (
              <rect
                key={`box${bi}`}
                x={box.left * width}
                y={box.top * height}
                width={box.width * width}
                height={box.height * height}
                fill="black"
              />
            ))}
        </mask>

        <rect
          key="white-overlay"
          width={width}
          height={height}
          fill="white"
          opacity={opacity}
          mask={`url(#${maskId})`}
        />
        {fadeShow.map((boxGrp, gi) =>
          boxGrp
            .filter((b) => b.page === pageNumber)
            .map((box, bi) => (
              <rect
                key={`group${gi}-box${bi}`}
                x={box.left * width}
                y={box.top * height}
                width={box.width * width}
                height={box.height * height}
                fill="white"
                opacity={gi * (opacity / (fadeShow.length + 1))}
              />
            ))
        )}
        {this.props.children}
      </svg>
    );
  }
}

export default FadePageMask;
