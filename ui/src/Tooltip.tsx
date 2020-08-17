import Card from "@material-ui/core/Card";
import React from "react";
import { BoundingBox } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

interface Props {
  /**
   * pdf.js PDFPageView object for the page that the anchor appears on. Used to
   * compute absolute positioning of the sidenote.
   */
  pageView: PDFPageView;
  /**
   * An anchor below which the tooltip will appear. Given in ratio coordinates
   * (each number is 0..1, relative to page width or height).
   */
  anchor: BoundingBox;
  /**
   * Content to show in the tooltip.
   */
  content: React.ReactNode;
}

/**
 * A tooltip to show below an anchor on a page of a PDF. Implemented with the intent of
 * providing a faster tooltip than the one provided by Material UI, for which placement
 * is less buggy when placed on a page.
 */
class Tooltip extends React.PureComponent<Props> {
  render() {
    const { pageView, anchor } = this.props;

    /*
     * Determine tooltip position.
     */
    const TOOLTIP_MARGIN_TOP = 10;
    const anchorPosition = uiUtils.getPositionInPageView(pageView, anchor);
    const tooltipTop =
      anchorPosition.top + anchorPosition.height + TOOLTIP_MARGIN_TOP;
    const tooltipCenterX = anchorPosition.left + anchorPosition.width + 2;

    return (
      <Card
        style={{
          top: tooltipTop,
          left: tooltipCenterX,
          transform: "translate(-50%, 0)",
        }}
        className="scholar-reader-tooltip tooltip"
      >
        {this.props.content}
      </Card>
    );
  }
}

export default Tooltip;
