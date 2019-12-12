import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MuiTooltip from "@material-ui/core/Tooltip";
import React from "react";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import { BoundingBox } from "./types/api";
import * as uiUtils from "./ui-utils";

interface AnnotationProps {
  className?: string;
  tooltipContent: React.ReactNode;
  location: BoundingBox;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  selected?: boolean;
  onSelected?: () => void;
  onDeselected?: () => void;
}

interface AnnotationState {
  selected: boolean;
}

export class Annotation extends React.Component<
  AnnotationProps,
  AnnotationState
> {
  constructor(props: AnnotationProps) {
    super(props);
    this.state = { selected: false };
  }

  select() {
    this.setState({ selected: true });
    if (this.props.onSelected) {
      this.props.onSelected();
    }
  }

  deselect() {
    this.setState({ selected: false });
    if (this.props.onDeselected) {
      this.props.onDeselected();
    }
  }

  isSelected() {
    return this.props.selected || this.state.selected;
  }

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (uiUtils.isKeypressEscape(e)) {
      this.deselect();
    }
    if (this.props.onKeyDown !== undefined) {
      this.props.onKeyDown(e);
    }
  }

  focusOnSelected(ref: HTMLDivElement | null) {
    if (ref !== null && this.isSelected()) {
      ref.focus();
    }
  }

  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ pages }) => {
          return (
            <ClickAwayListener onClickAway={this.deselect.bind(this)}>
              <MuiTooltip
                className="tooltip"
                open={this.isSelected()}
                onOpen={this.select.bind(this)}
                onClose={this.deselect.bind(this)}
                interactive
                disableHoverListener
                title={this.props.tooltipContent}
              >
                <div
                  ref={this.focusOnSelected.bind(this)}
                  onClick={this.select.bind(this)}
                  style={selectors.divDimensionStyles(
                    pages[this.props.location.page + 1].view,
                    this.props.location
                  )}
                  className={
                    "scholar-reader-annotation" +
                    (` ${this.props.className}` || "") +
                    ` ${this.isSelected() ? "selected" : ""}`
                  }
                  tabIndex={0}
                  onKeyDown={this.onKeyDown.bind(this)}
                />
              </MuiTooltip>
            </ClickAwayListener>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default Annotation;
