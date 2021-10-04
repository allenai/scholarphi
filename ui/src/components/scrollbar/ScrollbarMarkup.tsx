import React from "react";
import { CaptionUnit, DiscourseObj } from "../../api/types";
import { MediaTag } from "./MediaTag";
import { ScrollbarMark } from "./ScrollbarMark";

interface Props {
  numPages: number;
  discourseObjs: DiscourseObj[];
  captionUnits: CaptionUnit[];
  handleMarkClicked: (id: string) => void;
}

class ScrollbarMarkup extends React.PureComponent<Props> {
  static scrollbarHeight = document.getElementById("viewerContainer")
    ?.clientHeight;

  constructor(props: Props) {
    super(props);
  }

  mapDiscourseToScrollBar = (page: number, top: number): number => {
    if (ScrollbarMarkup.scrollbarHeight === undefined) {
      return 0;
    }
    const pageHeightInScrollbar =
      ScrollbarMarkup.scrollbarHeight / this.props.numPages;
    return (page + top) * pageHeightInScrollbar;
  };

  render() {
    const { discourseObjs, captionUnits } = this.props;

    return (
      <>
        {ScrollbarMarkup.scrollbarHeight !== undefined ? (
          <div className={"scrollbar-markup"}>
            <div className={"scrollbar-track"}></div>
            {captionUnits.map((c: CaptionUnit, i: number) => (
              <MediaTag
                key={`media-tag-${i}`}
                type={c.type}
                yOffset={this.mapDiscourseToScrollBar(
                  c.bbox.page + 1,
                  c.bbox.top
                )}
              />
            ))}
            {discourseObjs
              .filter((d: DiscourseObj) => d.label !== "Author")
              .map((d: DiscourseObj, i: number) => (
                <ScrollbarMark
                  sentence={d}
                  handleMarkClicked={() => this.props.handleMarkClicked(d.id)}
                  mapDiscourseToScrollBar={this.mapDiscourseToScrollBar}
                />
              ))}
          </div>
        ) : null}
      </>
    );
  }
}

export default ScrollbarMarkup;
