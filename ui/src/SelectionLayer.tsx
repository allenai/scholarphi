import React from "react";
import Selection, { Point } from "./Selection";
import * as uiUtils from "./ui-utils";

interface SelectionCanvasProps {
  onSelection: (anchor: Point, active: Point) => void;
}

interface SelectionCanvasState {
  anchor: Point | null;
  active: Point | null;
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
            this.setState({ anchor: uiUtils.getMouseXY(e) });
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
            this.setState({ active: uiUtils.getMouseXY(e) });
          }
        }}
        /*
         * To capture keydown events, tabIndex above must be set to 0.
         */
        tabIndex={0}
        onKeyDown={e => {
          if (uiUtils.isKeypressEscape(e)) {
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
