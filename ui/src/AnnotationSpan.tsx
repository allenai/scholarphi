import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MuiTooltip from "@material-ui/core/Tooltip";
import classNames from "classnames";
import React from "react";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import { BoundingBox } from "./types/api";
import * as uiUtils from "./ui-utils";

interface AnnotationSpanProps {
  /**
   * ID of the annotation this span belongs to.
   */
  annotationId: string;
  /**
   * Unique ID for this annotation span.
   */
  id: number;
  /**
   * When inactive, the annotation span is not interactive (i.e. it cannot be clicked, and its
   * tooltip will not appear). An empty box will appear in the place of the span.
   */
  inactive?: boolean;
  /**
   * Bounding box of the region of the paper this span was created to cover.
   */
  location: BoundingBox;
  className?: string;
  shouldHighlight?: boolean;
  /**
   * Correction factor to apply to bounding box coordinates before rendering the annotation.
   * You normally should not need to set this and should be able to trust the defaults.
   */
  scaleCorrection?: number;
  tooltipContent: React.ReactNode | null;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export class AnnotationSpan extends React.PureComponent<AnnotationSpanProps> {
  static defaultProps = {
    shouldHighlight: false
  };
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (uiUtils.isKeypressEscape(e)) {
      this.deselectIfSelected();
    }
    if (this.props.onKeyDown !== undefined) {
      this.props.onKeyDown(e);
    }
  }

  isSelected() {
    return this.props.id === this.context.selectedAnnotationSpanId;
  }

  isAnnotationSelected() {
    return this.props.annotationId === this.context.selectedAnnotationId;
  }

  select() {
    this.context.setSelectedAnnotationId(this.props.annotationId);
    this.context.setSelectedAnnotationSpanId(this.props.id);
  }

  deselectIfSelected() {
    /*
     * Only set the selected annotation ID to null if this annotation was the most-recently
     * selected annotation. If this was not the most-recently selected annotation, then this
     * callback may have just been triggered by a user clicking on another annotation. If
     * the user just clicked on another annotation, setting the annotation ID to 'null' would
     * nullify that new selection, which we don't want.
     */
    if (this.isSelected()) {
      this.context.setSelectedAnnotationId(null);
      this.context.setSelectedAnnotationSpanId(null);
    }
  }

  focusIfSelected(element: HTMLDivElement | null) {
    if (element !== null && this.isSelected()) {
      element.focus();
    }
  }

  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ pages }) => {
          return (
            <ClickAwayListener onClickAway={this.deselectIfSelected.bind(this)}>
              <MuiTooltip
                className="tooltip"
                open={
                  this.props.inactive !== true &&
                  this.props.tooltipContent !== null &&
                  this.isSelected()
                }
                interactive
                disableHoverListener
                title={this.props.tooltipContent}
              >
                <div
                  ref={this.focusIfSelected.bind(this)}
                  onClick={this.select.bind(this)}
                  style={selectors.divDimensionStyles(
                    pages[this.props.location.page + 1].view,
                    this.props.location,
                    this.props.scaleCorrection
                  )}
                  className={classNames(
                    "scholar-reader-annotation-span",
                    this.props.className,
                    {
                      selected: this.isSelected(),
                      active: this.props.inactive !== true,
                      inactive: this.props.inactive === true,
                      "annotation-selected": this.isAnnotationSelected()
                    }
                  )}
                  tabIndex={this.props.inactive ? undefined : 0}
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

export default AnnotationSpan;
