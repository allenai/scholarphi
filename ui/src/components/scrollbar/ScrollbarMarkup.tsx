import React from "react";
import { DiscourseObj } from "../../api/types";
import * as uiUtils from "../../utils/ui";

interface Props {
  numPages: number;
  discourseObjs: DiscourseObj[];
}

class ScrollbarMarkup extends React.PureComponent<Props> {
  static scrollbarHeight = document.getElementById("viewerContainer")
    ?.clientHeight;
  static scrollbarOffsetTop = document.getElementById("viewerContainer")
    ?.offsetTop;
  static scrollbarWidth = 15; // pixels
  static scrollbarMarkHeight = 5; // pixels

  constructor(props: Props) {
    super(props);
  }

  mapDiscourseToScrollBar = (page: number, top: number) => {
    if (
      ScrollbarMarkup.scrollbarHeight === undefined ||
      ScrollbarMarkup.scrollbarOffsetTop === undefined
    ) {
      return;
    }
    const pageHeightInScrollbar =
      ScrollbarMarkup.scrollbarHeight / this.props.numPages;
    return (page + top) * pageHeightInScrollbar;
  };

  render() {
    const { discourseObjs } = this.props;

    return (
      <>
        {ScrollbarMarkup.scrollbarHeight !== undefined ? (
          <div
            className={"scrollbar-markup"}
            style={{
              position: "absolute",
              height: ScrollbarMarkup.scrollbarHeight,
              width: ScrollbarMarkup.scrollbarWidth,
              top: ScrollbarMarkup.scrollbarOffsetTop,
              pointerEvents: "none",
              right: 0,
              overflowY: "hidden",
            }}
          >
            {discourseObjs.map((d, i) => (
              <div
                style={{
                  position: "absolute",
                  top: this.mapDiscourseToScrollBar(
                    d.bboxes[0].page,
                    d.bboxes[0].top
                  ),
                  width: ScrollbarMarkup.scrollbarWidth,
                  height: ScrollbarMarkup.scrollbarMarkHeight,
                  background: uiUtils.updateAlpha(d.color, 0.9),
                  border: "1px solid grey",
                }}
                key={`scrollbar-mark-${i}`}
              ></div>
            ))}
          </div>
        ) : null}
      </>
    );
  }
}

export default ScrollbarMarkup;
