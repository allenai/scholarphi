import Card from "@material-ui/core/Card";
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
  /**
   * Color (hex) to render tag.
   */
  color?: string;
  entityId: string;
}

/**
 * A side note shown in the margin of a page.
 */
export class DiscourseTag extends React.PureComponent<Props> {
  render() {
    const { pageView, anchor, content, color } = this.props;

    const side =
      anchor.left * pageView.div.clientWidth < pageView.div.clientWidth / 2
        ? "left"
        : "right";

    /*
     * Determine sidenote position.
     */
    const anchorPosition = uiUtils.getPositionInPageView(pageView, anchor);
    const sidenoteTop = anchorPosition.top;

    /*
     * Determine position of rule connecting sidenote to anchor.
     */
    const SIDENOTE_MARGIN = 20; // pixels
    const LEFT_RULE_INDENT = 5; // pixels
    const anchorRight = anchorPosition.left + anchorPosition.width;
    const anchorBottom = anchorPosition.top + anchorPosition.height;
    const ruleTop = anchorBottom;
    const ruleRight =
      side === "left"
        ? pageView.div.clientWidth - anchorPosition.left - LEFT_RULE_INDENT
        : undefined;
    const ruleLeft = side === "right" ? anchorRight : undefined;
    const ruleWidth =
      side === "left"
        ? anchorPosition.left +
          SIDENOTE_MARGIN +
          LEFT_RULE_INDENT -
          0.1 * pageView.div.clientWidth
        : 0.9 * pageView.div.clientWidth -
          anchorRight +
          SIDENOTE_MARGIN;

    return (
      <>
        <hr
          className="discourse-tag-rule"
          style={{
            top: ruleTop,
            left: ruleLeft,
            right: ruleRight,
            width: ruleWidth,
          }}
        />
        <Card
          className={classNames("scholar-reader-discourse-tag", `side-${side}`)}
          id={`discourse-tag-${this.props.entityId}`}
          style={{
            top: sidenoteTop,
            backgroundColor: color !== undefined ? color : undefined,
          }}
        >
          {content}
        </Card>
      </>
    );
  }
}

export default DiscourseTag;
