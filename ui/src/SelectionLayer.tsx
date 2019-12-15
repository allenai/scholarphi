import React from "react";
import Selection, { Point } from "./Selection";
import * as uiUtils from "./ui-utils";

interface SelectionCanvasProps {
  onSelection: (anchor: Point, active: Point) => void;
}

interface SelectionCanvasState {
  anchor: Point | null;
  active: Point | null;
  hasFocus: boolean;
}

export class SelectionCanvas extends React.Component<
  SelectionCanvasProps,
  SelectionCanvasState
> {
  constructor(props: SelectionCanvasProps) {
    super(props);
    this.state = {
      anchor: null,
      active: null,
      hasFocus: false
    };
  }

  onClick(e: React.MouseEvent<HTMLDivElement>) {
    this.terminateIfEventOutsideElement(e);
    if (this.state.hasFocus && this.state.anchor === null) {
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
      this.terminateSelection();
    }
  }

  onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    this.terminateIfEventOutsideElement(e);
    if (this.state.hasFocus && this.state.anchor !== null) {
      /*
       * Update selection.
       */
      this.setState({ active: uiUtils.getMouseXY(e) });
    }
  }

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    this.terminateIfEventOutsideElement(e);
    if (this.state.hasFocus && uiUtils.isKeypressEscape(e)) {
      this.terminateSelection();
    }
  }

  onFocus() {
    this.setState({ hasFocus: true });
  }

  onBlur() {
    this.setState({ hasFocus: false });
    this.terminateSelection();
  }

  terminateIfEventOutsideElement(
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) {
    if (e.currentTarget !== this.elementRef) {
      this.terminateSelection();
    }
  }

  terminateSelection() {
    this.setState({ anchor: null, active: null });
  }

  render() {
    return (
      <div
        className="selection-layer"
        ref={ref => {
          this.elementRef = ref;
        }}
        onFocus={this.onFocus.bind(this)}
        onBlur={this.onBlur.bind(this)}
        onClick={this.onClick.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        /*
         * Capture keydown and focus events by setting tabIndex to 0.
         */
        tabIndex={0}
        onKeyDown={this.onKeyDown.bind(this)}
      >
        {this.state.anchor !== null && this.state.active !== null && (
          <Selection anchor={this.state.anchor} active={this.state.active} />
        )}
      </div>
    );
  }

  private elementRef: HTMLDivElement | null = null;
}

export default SelectionCanvas;
