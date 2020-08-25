import React from "react";

interface Props {
  textClassname?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  onClick?: () => void;
}

class DiagramLabel extends React.PureComponent<Props> {
  render() {
    const { x, y, width, height, text } = this.props;
    return (
      <g className="diagram-label" transform={`translate(${x}, ${y})`}>
        <rect
          onClick={this.props.onClick}
          className="diagram-label__background"
          width={width}
          height={height}
          rx="5"
          ry="5"
        />
        <text
          onClick={this.props.onClick}
          className={this.props.textClassname}
          textAnchor="middle"
          dominantBaseline="middle"
          x={width / 2}
          y={height / 2}
          dy=".1em"
        >
          {text}
        </text>
      </g>
    );
  }
}

export default DiagramLabel;
