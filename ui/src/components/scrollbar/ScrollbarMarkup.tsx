import React from "react";
import { SkimmingAnnotation } from "../../api/types";
import { Entities } from "../../state";

interface Props {
  numPages: number;
  entities: Entities;
  skimmingData: SkimmingAnnotation;
  customDiscourseTags: object;
  discourseToColorMap: { [discourse: string]: string };
  deselectedDiscourses: string[];
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
    const {
      entities,
      skimmingData,
      customDiscourseTags,
      discourseToColorMap,
      deselectedDiscourses,
    } = this.props;

    const discourseObjs = Object.entries({
      ...skimmingData.discourseTags,
      ...customDiscourseTags,
    })
      .map(([id, discourse]) => ({
        id: id,
        entity: entities.byId[id],
        discourse: discourse as string,
      }))
      .map((e) => ({
        ...e,
        tagLocation:
          e.entity.attributes.bounding_boxes[
            e.entity.attributes.bounding_boxes.length - 1
          ],
        color: discourseToColorMap[e.discourse],
      }))
      .filter((e) => !deselectedDiscourses.includes(e.discourse));

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
            }}
          >
            {discourseObjs.map((d, i) => (
              <div
                style={{
                  position: "absolute",
                  top: this.mapDiscourseToScrollBar(
                    d.entity.attributes.bounding_boxes[0].page,
                    d.entity.attributes.bounding_boxes[0].top
                  ),
                  width: ScrollbarMarkup.scrollbarWidth,
                  height: ScrollbarMarkup.scrollbarMarkHeight,
                  background: d.color,
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
