import React from "react";
import Selection, { Point } from "./Selection";

interface SelectionCanvasProps {
  onSelection: (anchor: Point, active: Point) => void;
}

interface SelectionCanvasState {
  anchor: Point | null;
  active: Point | null;
}

function getMouseXY(event: React.MouseEvent) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
}

function isKeypressEscape(event: React.KeyboardEvent) {
  if (
    event.key !== undefined &&
    (event.key === "Esc" || event.key === "Escape")
  ) {
    return true;
  }
  if (event.keyCode !== undefined && event.keyCode === 27) {
    return true;
  }
  return false;
}

export class SelectionCanvas extends React.Component<
  SelectionCanvasProps,
  SelectionCanvasState
> {
  constructor(props: SelectionCanvasProps) {
    super(props);
    this.state = {
      anchor: null,
      active: null
    };
  }

  render() {
    return (
      <div
        className="selection-canvas"
        onClick={e => {
          if (this.state.anchor === null) {
            /*
             * Start selection.
             */
            this.setState({ anchor: getMouseXY(e) });
          } else if (this.state.anchor !== null) {
            /*
             * Finalize selection.
             */
            if (this.state.active !== null) {
              this.props.onSelection(this.state.anchor, this.state.active);
            }
            this.setState({ anchor: null, active: null });
          }
        }}
        onMouseMove={e => {
          if (this.state.anchor !== null) {
            /*
             * Update selection.
             */
            this.setState({ active: getMouseXY(e) });
          }
        }}
        tabIndex={0}
        onKeyDown={e => {
          /*
           * To capture keydown events, tabIndex above must be set to 0.
           */
          if (isKeypressEscape(e)) {
            this.setState({ anchor: null, active: null });
          }
        }}
      >
        {this.state.anchor !== null && this.state.active !== null && (
          <Selection anchor={this.state.anchor} active={this.state.active} />
        )}
      </div>
    );
  }
}

export default SelectionCanvas;
