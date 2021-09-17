import React from "react";

interface Props {
  type: string;
  yOffset: number; // Vertical offset measured in px relative to viewport
}

export class MediaTag extends React.PureComponent<Props> {
  render() {
    const { type, yOffset } = this.props;

    return (
      <div className={"scrollbar-media-tag"} style={{ top: yOffset }}>
        <span className={"scrollbar-media-tag__text"}>
          {type === "figure" && "FIG"}
          {type === "table" && "TAB"}
        </span>
      </div>
    );
  }
}
