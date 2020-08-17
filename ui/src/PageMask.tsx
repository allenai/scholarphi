import React from "react";
import { BoundingBox } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

interface Props {
  pageView: PDFPageView;
  /**
   * Regions where the mask should be removed to show content.
   */
  show: BoundingBox[];
  /**
   * Regions where highlights should be overlaid on top of the page.
   */
  highlight?: BoundingBox[];
}

/**
 * A mask overlaid on a page of a PDF that shows some of the content and hides the rest.
 */
class PageMask extends React.PureComponent<Props> {
  render() {
    const { pageView, show, highlight } = this.props;
    const { width, height } = uiUtils.getPageViewDimensions(pageView);
    const pageNumber = uiUtils.getPageNumber(pageView);

    const maskId = `page-${pageNumber}-mask`;
    return (
      <svg className="page-mask" width={width} height={height}>
        <mask id={maskId}>
          {/*
           * Where the SVG mask is white, the overlay mask will show. Start by showing the
           * mask everywhere, and subtract from it. Setting the fill to "white" sets the
           * initial mask area as the entire page. Setting the fill to "black" (as with the
           * rectangles below) subtracts from the mask.
           */}
          <rect
            key="entire-page-mask"
            width={width}
            height={height}
            fill="white"
          />
          {/*
           * Subtract from the mask wherever a sentence should be activated.
           */}
          {show
            .filter((b) => b.page === pageNumber)
            .map((b, i) => (
              <rect
                key={`box${i}`}
                x={b.left * width}
                y={b.top * height}
                width={b.width * width}
                height={b.height * height}
                fill="black"
              />
            ))}
        </mask>
        {/* Show a white mask over the page where a 'show' region doesn't appear. */}
        <rect
          key="white-overlay"
          width={width}
          height={height}
          fill="white"
          opacity={0.5}
          mask={`url(#${maskId})`}
        />
        {highlight !== undefined
          ? highlight
              .filter((b) => b.page === pageNumber)
              .map((b, i) => (
                <React.Fragment key={`highlight-${i}`}>
                  <rect
                    className="page-mask__highlight"
                    x={b.left * width}
                    y={b.top * height}
                    width={b.width * width}
                    height={b.height * height}
                  />
                  <line
                    className="page-mask__underline"
                    x1={b.left * width}
                    x2={(b.left + b.width) * width}
                    y1={(b.top + b.height) * height + 2}
                    y2={(b.top + b.height) * height + 2}
                  />
                </React.Fragment>
              ))
          : null}
        {this.props.children}
      </svg>
    );
  }
}

export default PageMask;
