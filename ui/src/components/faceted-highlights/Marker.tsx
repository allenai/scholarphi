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
  handleMarkerClicked?: (id: string) => void;
}

/**
 * A small indicator shown at a specified position.
 */
export class Marker extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  handleOnClick = () => {
    if (this.props.handleMarkerClicked !== undefined) {
      this.props.handleMarkerClicked(this.props.id);
    }
  };

  render() {
    const { id, pageView, anchor, show } = this.props;

    const side =
      anchor.left * pageView.div.clientWidth < pageView.div.clientWidth / 2
        ? "left"
        : "right";
    const anchorPosition = uiUtils.getPositionInPageView(pageView, anchor);
    const sidenoteTop = anchorPosition.top;

    return (
      // <div
      //   className={classNames("reader-marker", `side-${side}`)}
      //   id={`marker-${id}`}
      //   style={{
      //     top: sidenoteTop,
      //     display: show ? "block" : "none",
      //   }}
      //   onClick={this.handleOnClick}
      // ><PlaylistAddIcon/></div>

      <div
      className={classNames("reader-marker", `side-${side}`)}
            id={`marker-${id}`}
        style={{
          top: sidenoteTop,
          display: show ? "block" : "none",
        }}
      >
        <MuiTooltip title={"Show more"}>
          <IconButton
            size="small"
            onClick={this.handleOnClick}
          >
            <PlaylistAddIcon />
          </IconButton>
        </MuiTooltip>
      </div>
    );
  }
}

export default Marker;
