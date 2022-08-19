import React from "react";
import { DiscourseObj } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import * as uiUtils from "../../utils/ui";

const logger = getRemoteLogger();

interface Props {
  sentence: DiscourseObj;
  handleMarkClicked: () => void;
  mapDiscourseToScrollBar: (page: number, top: number) => number;
}

export class ScrollbarMark extends React.PureComponent<Props> {
  onMarkClicked = () => {
    logger.log("debug", "click-scrollbar-mark", {
      discourse: this.props.sentence,
    });
    this.props.handleMarkClicked();
  };

  render() {
    const { sentence } = this.props;

    return (
      <div
        className={"scrollbar-mark"}
        onClick={this.onMarkClicked}
        style={{
          top: this.props.mapDiscourseToScrollBar(
            sentence.boxes[0].page,
            sentence.boxes[0].top
          ),
          background: uiUtils.updateAlpha(sentence.color, 0.9),
        }}
        key={`scrollbar-mark-${sentence.id}`}
      ></div>
    );
  }
}
