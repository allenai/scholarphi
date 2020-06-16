import MuiTooltip from "@material-ui/core/Tooltip";
import classNames from "classnames";
import React from "react";
import * as selectors from "./selectors";
import { BoundingBox } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

/**
 * Many of these properties are analogous to those in 'Annotation'. For complete documentation,
 * see the docstrings for the 'Annotation' properties.
 */
interface AnnotationSpanProps {
  pageView: PDFPageView;
  /**
   * ID of the annotation this span belongs to.
   */
  annotationId: string;
  /**
   * Unique ID for this annotation span.
   */
  id: string;
  active?: boolean;
  isAnnotationSelected?: boolean;
  isSpanSelected?: boolean;
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
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleSelectAnnotation: (annotationId: string) => void;
  handleSelectSpan: (spanId: string) => void;
}

export class AnnotationSpan extends React.PureComponent<AnnotationSpanProps> {
  static defaultProps = {
    active: true,
    isAnnotationSelected: false,
    isSpanSelected: false,
    highlight: false,
  };

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (this.props.onKeyDown !== undefined) {
      this.props.onKeyDown(e);
    }
  }

  onClick() {
    this.props.handleSelectAnnotation(this.props.annotationId);
    this.props.handleSelectSpan(this.props.id);
    if (this.props.onSelected !== undefined) {
      this.props.onSelected();
    }
  }

  focusIfSelected(element: HTMLDivElement | null) {
    if (element !== null && this.props.isSpanSelected) {
      element.focus();
    }
  }

  render() {
    const { pageView } = this.props;

    /*
     * By default, an annotation span is just a positioned div.
     */
    let annotationSpan = (
      <div
        ref={this.focusIfSelected.bind(this)}
        onClick={this.onClick.bind(this)}
        style={selectors.divDimensionStyles(
          pageView,
          this.props.location,
          this.props.scaleCorrection
        )}
        className={classNames(
          "scholar-reader-annotation-span",
          this.props.className,
          {
            selected: this.props.isSpanSelected,
            "annotation-selected": this.props.isAnnotationSelected,
            active: this.props.active === true,
            inactive: this.props.active !== true,
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
          open={this.props.active === true && this.props.isSpanSelected}
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
