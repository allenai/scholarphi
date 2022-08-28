import React from "react";
import { CaptionUnit, FacetedHighlight } from "../../api/types";
import { MediaTag } from "./MediaTag";
import { ScrollbarMark } from "./ScrollbarMark";

interface Props {
  numPages: number;
  facetedHighlights: FacetedHighlight[];
  captionUnits: CaptionUnit[];
  handleMarkClicked: (id: string) => void;
}

class ScrollbarMarkup extends React.PureComponent<Props> {
  static scrollbarHeight = document.getElementById("viewerContainer")
    ?.clientHeight;

  constructor(props: Props) {
    super(props);
  }

  mapHighlightToScrollbar = (page: number, top: number): number => {
    if (ScrollbarMarkup.scrollbarHeight === undefined) {
      return 0;
    }
    const pageHeightInScrollbar =
      ScrollbarMarkup.scrollbarHeight / this.props.numPages;
    return (page + top) * pageHeightInScrollbar;
  };

  render() {
    const { facetedHighlights, captionUnits } = this.props;

    return (
      <>
        {ScrollbarMarkup.scrollbarHeight !== undefined ? (
          <div className={"scrollbar-markup"}>
            <div className={"scrollbar-track"}></div>
            {captionUnits.map((c: CaptionUnit, i: number) => (
              <MediaTag
                key={`media-tag-${i}`}
                type={c.type}
                yOffset={this.mapHighlightToScrollbar(
                  c.bbox.page + 1,
                  c.bbox.top
                )}
              />
            ))}
            {facetedHighlights.map((d: FacetedHighlight, i: number) => (
              <ScrollbarMark
                key={`scrollbar-mark-${i}`}
                sentence={d}
                handleMarkClicked={() => this.props.handleMarkClicked(d.id)}
                mapHighlightToScrollbar={this.mapHighlightToScrollbar}
              />
            ))}
          </div>
        ) : null}
      </>
    );
  }
}

export default ScrollbarMarkup;
