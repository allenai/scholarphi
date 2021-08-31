import Card from "@material-ui/core/Card";
import React from "react";
import { BoundingBox } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

export type TooltipPlacement = "above" | "below" | "lower-right" | "upper-right";

interface Props {
  /**
   * pdf.js PDFPageView object for the page that the anchor appears on. Used to
   * compute absolute positioning of the sidenote.
   */
  pageView: PDFPageView;
  /**
   * An anchor next to which the tooltip will appear. Box is expressed in ratio coordinates
   * (each number is 0..1, relative to page width or height).
   */
  anchor: BoundingBox;
  /**
   * Where to place the tooltip relative to the anchor. Defaults to "below".
   */
  placement?: TooltipPlacement;
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
export class Tooltip extends React.PureComponent<Props> {
  static defaultProps = {
    placement: "below",
  };

  render() {
    const { pageView, anchor, placement } = this.props;

    /*
     * Align the horizontal center of the tooltip with the center of the anchor.
     */
    const anchorPosition = uiUtils.getPositionInPageView(pageView, anchor);
    const tooltipCenterX = anchorPosition.left + anchorPosition.width + 2;
    let style: React.CSSProperties = {
      left: tooltipCenterX,
      transform: "translate(-50%, 0)",
    };

    /*
     * Determine vertical placement of the tooltip.
     */
    const TOOLTIP_VERTICAL_MARGIN = 4;
    if (placement === "below") {
      style.top =
        anchorPosition.top + anchorPosition.height + TOOLTIP_VERTICAL_MARGIN;
    } else if (placement === "lower-right") {
      style.transform = "";
      style.top =
        anchorPosition.top + anchorPosition.height + TOOLTIP_VERTICAL_MARGIN;
    } else if (placement === "upper-right") {
      // style.transform = "";
      const { height: pageHeight } = uiUtils.getPageViewDimensions(pageView);
      style.bottom = pageHeight - anchorPosition.top + TOOLTIP_VERTICAL_MARGIN;
    }
    else {
      const { height: pageHeight } = uiUtils.getPageViewDimensions(pageView);
      style.bottom = pageHeight - anchorPosition.top + TOOLTIP_VERTICAL_MARGIN;
    }

    return (
      <Card
        className="scholar-reader-tooltip tooltip"
        style={style}
        elevation={uiUtils.TOOLTIP_ELEVATION}
      >
        {this.props.content}
      </Card>
    );
  }
}
