import React from "react";
import { DiscourseObj } from "../../api/types";
import * as uiUtils from "../../utils/ui";


interface Props {
  sentence: DiscourseObj;
  handleMarkClicked: () => void;
  mapDiscourseToScrollBar: (page: number, top: number) => number;
}

export class ScrollbarMark extends React.PureComponent<Props> {
  render() {
    const { sentence } = this.props;

    return (
      <div
        className={"scrollbar-mark"}
        onClick={this.props.handleMarkClicked}
        style={{
          top: this.props.mapDiscourseToScrollBar(
            sentence.bboxes[0].page,
            sentence.bboxes[0].top
          ),
          background: uiUtils.updateAlpha(sentence.color, 0.9),
        }}
        key={`scrollbar-mark-${sentence.id}`}
      ></div>
    );
  }
}
