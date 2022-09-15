import { Remove } from "@mui/icons-material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import IconButton from "@mui/material/IconButton";
import MuiTooltip from "@mui/material/Tooltip";
import classNames from "classnames";
import React from "react";
import { BoundingBox } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

interface Props {
  id: string;
  show: boolean;
  disableIncreaseHighlights: boolean;
  disableDecreaseHighlights: boolean;
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
  handleIncreaseHighlights: (id: string) => void;
  handleDecreaseHighlights: (id: string) => void;
}

export class HighlightMarginControls extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      id,
      pageView,
      anchor,
      show,
      disableIncreaseHighlights,
      disableDecreaseHighlights,
    } = this.props;

    const side =
      anchor.left * pageView.div.clientWidth < pageView.div.clientWidth / 2
        ? "left"
        : "right";
    const anchorPosition = uiUtils.getPositionInPageView(pageView, anchor);
    const controlsHeight = 80;

    return (
      <div>
        <div
          style={{
            display: show ? "block" : "none",
            top: anchorPosition.top - anchorPosition.height / 2,
            height: anchorPosition.height,
          }}
          className={classNames(
            "highlight-controls",
            "vertical-indicator",
            `side-${side}`,
            `vertical-indicator-${side}`
          )}
        ></div>
        <div
          style={{
            height: `${controlsHeight}px`,
            top: anchorPosition.top - controlsHeight / 2,
            display: show ? "block" : "none",
          }}
          className={classNames("highlight-controls", `side-${side}`)}
        >
          <div className={classNames("increase-highlights")}>
            <MuiTooltip
              title={disableIncreaseHighlights ? "" : "Show more"}
              placement={"top"}
            >
              <span>
                <IconButton
                  size="small"
                  disabled={disableIncreaseHighlights}
                  onClick={() => this.props.handleIncreaseHighlights(id)}
                >
                  <PlaylistAddIcon />
                </IconButton>
              </span>
            </MuiTooltip>
          </div>
          <div className={classNames("decrease-highlights")}>
            <MuiTooltip
              title={disableDecreaseHighlights ? "" : "Show less"}
              placement={"bottom"}
            >
              <span>
                <IconButton
                  size="small"
                  disabled={disableDecreaseHighlights}
                  onClick={() => this.props.handleDecreaseHighlights(id)}
                >
                  <Remove />
                </IconButton>
              </span>
            </MuiTooltip>
          </div>
        </div>
      </div>
    );
  }
}

export default HighlightMarginControls;
