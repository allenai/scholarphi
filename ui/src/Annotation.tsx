import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MuiTooltip from "@material-ui/core/Tooltip";
import classNames from "classnames";
import React from "react";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import { BoundingBox } from "./types/api";
import * as uiUtils from "./ui-utils";

interface AnnotationProps {
  /**
   * A unique ID that distinguishes this annotation from all other annotations.
   */
  id: string;
  /**
   * The data source that detected the annotated entity. This property should
   * be used for development purposes only. Production features and styles should not rely on this
   * property. It is provided to help developers visualize and compare the results of
   * different methods for detecting entities.
   */
  source?: string;
  className?: string;
  location: BoundingBox;
  /**
   * Correction factor to apply to bounding box coordinates before rendering the annotation.
   * You normally should not need to set this and should be able to trust the defaults.
   */
  scaleCorrection?: number;
  tooltipContent: React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

interface AnnotationState {
  selected: boolean;
}

export class Annotation extends React.PureComponent<
  AnnotationProps,
  AnnotationState
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  constructor(props: AnnotationProps) {
    super(props);
    this.state = { selected: false };
  }

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (uiUtils.isKeypressEscape(e)) {
      this.deselectIfSelected();
    }
    if (this.props.onKeyDown !== undefined) {
      this.props.onKeyDown(e);
    }
  }

  isSelected() {
    return this.props.id === this.context.selectedAnnotationId;
  }

  select() {
    this.context.setSelectedAnnotationId(this.props.id);
  }

  deselectIfSelected() {
    /*
     * Only set the selected annotation ID to null if this annotation was the most-recently
     * selected annotation. If this was not the most-recently selected annotation, then this
     * callback may have just been triggered by a user clicking on another annotation. If
     * the user just clicked on another annotation, setting the annotation ID to 'null' would
     * nullify that new selection, which we don't want.
     */
    if (this.context.selectedAnnotationId === this.props.id) {
      this.context.setSelectedAnnotationId(null);
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
                open={this.isSelected()}
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
                    "scholar-reader-annotation",
                    this.props.className,
                    {
                      selected: this.isSelected(),
                      "source-tex-pipeline":
                        this.props.source === "tex-pipeline",
                      "source-other": this.props.source === "other"
                    }
                  )}
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
