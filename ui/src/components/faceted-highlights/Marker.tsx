import classNames from "classnames";
import React from "react";
import { BoundingBox } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

interface Props {
  id: string;
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
  handleMarkerClicked: (section: string, active: boolean) => void;
}

interface State {
  active: boolean;
}

/**
 * A small indicator shown at a specified position.
 */
export class Marker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      active: false,
    };
  }

  handleOnClick = () => {
    this.props.handleMarkerClicked(this.props.id, !this.state.active);
    this.setState((prevState: State) => {
      return {
        ...prevState,
        active: !prevState.active,
      };
    });
  };

  render() {
    const { id, pageView, anchor } = this.props;

    const side =
      anchor.left * pageView.div.clientWidth < pageView.div.clientWidth / 2
        ? "left"
        : "right";
    const anchorPosition = uiUtils.getPositionInPageView(pageView, anchor);
    const sidenoteTop = anchorPosition.top;

    return (
      <div
        className={classNames("reader-marker", `side-${side}`, {
          active: this.state.active,
        })}
        id={`marker-${id}`}
        style={{
          top: sidenoteTop,
        }}
        onClick={this.handleOnClick}
      ></div>
    );
  }
}

export default Marker;
