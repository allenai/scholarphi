import Card from "@mui/material/Card";
import classNames from "classnames";
import React from "react";
import { BoundingBox } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

interface Props {
  /**
   * pdf.js PDFPageView object for the page that the anchor appears on. Used to
   * compute absolute positioning of the sidenote.
   */
  pageView: PDFPageView;
  /**
   * An anchor to which the side note is aligned. Given in ratio coordinates
   * (each number is 0..1, relative to page width or height). One example of an
   * anchor is a bounding box for a selected annotation. The side note will
   * be aligned to the top of the anchor. The side note will appear on whichever
   * side of the paper is closer to the anchor.
   */
  anchor: BoundingBox;
  /**
   * Content to show in the side note.
   */
  content: React.ReactNode;
}

/**
 * A side note shown in the margin of a page.
 */
export class Sidenote extends React.PureComponent<Props> {
  render() {
    const { pageView, anchor } = this.props;

    const anchorToPageRight = 1 - (anchor.left + anchor.width);
    const anchorToPageLeft = anchor.left;
    const side = anchorToPageLeft < anchorToPageRight ? "left" : "right";

    /*
     * Determine sidenote position.
     */
    const anchorPosition = uiUtils.getPositionInPageView(pageView, anchor);
    const sidenoteTop = anchorPosition.top;

    /*
     * Determine position of rule connecting sidenote to anchor.
     */
    const SIDENOTE_MARGIN = 20; // pixels
    const anchorRight = anchorPosition.left + anchorPosition.width;
    const anchorBottom = anchorPosition.top + anchorPosition.height;
    const ruleTop = anchorBottom;
    const ruleRight =
      side === "left" ? pageView.div.clientWidth - anchorRight : undefined;
    const ruleLeft = side === "right" ? anchorPosition.left : undefined;
    const ruleWidth =
      side === "left"
        ? anchorPosition.left + anchorPosition.width + SIDENOTE_MARGIN
        : pageView.div.clientWidth -
          anchorRight +
          anchorPosition.width +
          SIDENOTE_MARGIN;

    return (
      <>
        <hr
          className="sidenote-rule"
          style={{
            top: ruleTop,
            left: ruleLeft,
            right: ruleRight,
            width: ruleWidth,
          }}
        />
        <Card
          className={classNames("scholar-reader-sidenote", `side-${side}`)}
          style={{ top: sidenoteTop }}
        >
          {this.props.content}
        </Card>
      </>
    );
  }
}
