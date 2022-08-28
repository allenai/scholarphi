import React from "react";
import { FacetedHighlight } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import * as uiUtils from "../../utils/ui";

const logger = getRemoteLogger();

interface Props {
  sentence: FacetedHighlight;
  handleMarkClicked: () => void;
  mapHighlightToScrollbar: (page: number, top: number) => number;
}

export class ScrollbarMark extends React.PureComponent<Props> {
  onMarkClicked = () => {
    logger.log("debug", "click-scrollbar-mark", {
      highlight: this.props.sentence,
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
          top: this.props.mapHighlightToScrollbar(
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
