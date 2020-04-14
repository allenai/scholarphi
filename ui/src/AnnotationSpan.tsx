import MuiTooltip from "@material-ui/core/Tooltip";
import classNames from "classnames";
import React from "react";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import { BoundingBox } from "./types/api";
import * as uiUtils from "./ui-utils";

/**
 * Many of these properties are analogous to those in 'Annotation'. For complete documentation,
 * see the docstrings for the 'Annotation' properties.
 */
interface AnnotationSpanProps {
  /**
   * ID of the annotation this span belongs to.
   */
  annotationId: string;
  /**
   * Unique ID for this annotation span.
   */
  id: string;
  active?: boolean;
  /**
   * Where in the paper to draw this annotation span.
   */
  location: BoundingBox;
  className?: string;
  highlight?: boolean;
  /**
   * Correction factor to apply to bounding box coordinates before rendering the annotation.
   * You normally should not need to set this and should be able to trust the defaults.
   */
  scaleCorrection?: number;
  tooltipContent: React.ReactNode | null;
  onSelected?: () => void;
  onDeselected?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export class AnnotationSpan extends React.PureComponent<AnnotationSpanProps> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  static defaultProps = {
    active: true,
    highlight: false
  };

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
    if (this.props.onSelected !== undefined) {
      this.props.onSelected();
    }
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
      if (this.props.onDeselected !== undefined) {
        this.props.onDeselected();
      }
    }
  }

  focusIfSelected(element: HTMLDivElement | null) {
    if (element !== null && this.isSelected()) {
      element.focus();
    }
  }

  render() {
    const { pages } = this.context;
    if (pages === null) {
      return null;
    }

    /*
     * By default, an annotation span is just a positioned div.
     */
    let annotationSpan = (
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
            "annotation-selected": this.isAnnotationSelected(),
            active: this.props.active === true,
            inactive: this.props.active !== true
          }
        )}
        tabIndex={this.props.active === true ? 0 : undefined}
        onKeyDown={this.onKeyDown.bind(this)}
      />
    );

    /*
     * If tooltip content was provided, wrap span in a tooltip component.
     */
    if (this.props.tooltipContent !== null) {
      annotationSpan = (
        <MuiTooltip
          className="tooltip"
          open={this.props.active === true && this.isSelected()}
          interactive
          disableHoverListener
          title={this.props.tooltipContent}
        >
          {annotationSpan}
        </MuiTooltip>
      );
    }

    return annotationSpan;
  }
}

export default AnnotationSpan;
