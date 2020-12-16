import React from "react";

interface Props {
  anchor: Point;
  active: Point;
}

export interface Point {
  x: number;
  y: number;
}

export class Selection extends React.PureComponent<Props> {
  render() {
    const left = Math.min(this.props.anchor.x, this.props.active.x) + "px";
    const top = Math.min(this.props.anchor.y, this.props.active.y) + "px";
    const width = Math.abs(this.props.active.x - this.props.anchor.x) + "px";
    const height = Math.abs(this.props.active.y - this.props.anchor.y) + "px";
    const style = { left, top, width, height };
    return <div className="selection" style={style} />;
  }
}

export default Selection;
