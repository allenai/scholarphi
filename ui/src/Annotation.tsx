import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MuiTooltip from "@material-ui/core/Tooltip";
import React from "react";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import { BoundingBox } from "./types/api";

interface AnnotationProps {
  tooltipContent: React.ReactNode;
  location: BoundingBox;
}

interface AnnotationState {
  tooltipOpen: boolean;
}

export class Annotation extends React.Component<
  AnnotationProps,
  AnnotationState
> {
  constructor(props: AnnotationProps) {
    super(props);
    this.state = { tooltipOpen: false };
  }

  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ pages }) => {
          return (
            <ClickAwayListener
              onClickAway={() => this.setState({ tooltipOpen: false })}
            >
              <MuiTooltip
                className="tooltip"
                open={this.state.tooltipOpen}
                onOpen={() => this.setState({ tooltipOpen: true })}
                onClose={() => this.setState({ tooltipOpen: false })}
                interactive
                disableHoverListener
                title={this.props.tooltipContent}
              >
                <div
                  onClick={() => this.setState({ tooltipOpen: true })}
                  style={selectors.divDimensionStyles(
                    pages[this.props.location.page + 1].view,
                    this.props.location
                  )}
                  className="scholar-reader-annotation"
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
