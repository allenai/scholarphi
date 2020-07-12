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
interface Props {
  pageView: PDFPageView;
  /**
   * Unique ID for this annotation span.
   */
  id: string;
  className?: string;
  active: boolean;
  selected: boolean;
  location: BoundingBox;
  /**
   * Where in the paper to draw this annotation span.
   */
  tooltipContent: React.ReactNode | null;
  underline: boolean;
  /**
   * Correction factor to apply to bounding box coordinates before rendering the annotation.
   * While this was needed in past versions of the interface, at the time of this writing, the
   * data produced by the backend had been fixed such that this isn't necessary.
   * You shouldn't normally need to set this property.
   */
  scaleCorrection?: number;
  handleSelection: (spanId: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export class AnnotationSpan extends React.PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    active: true,
    selected: false,
  };

  constructor(props: Props) {
    super(props);
    this.focusIfSelected = this.focusIfSelected.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (this.props.handleSelection !== undefined) {
      this.props.handleSelection(this.props.id);
    }
  }

  focusIfSelected(element: HTMLDivElement | null) {
    if (element !== null && this.props.selected) {
      element.focus();
    }
  }

  render() {
    /*
     * By default, an annotation span is just a positioned div.
     */
    let span = (
      <div
        ref={this.focusIfSelected}
        className={classNames(
          "scholar-reader-annotation-span",
          this.props.className,
          {
            selected: this.props.selected,
            active: this.props.active === true,
            inactive: this.props.active !== true,
            underline: this.props.active === true && this.props.underline,
          }
        )}
        style={selectors.divDimensionStyles(
          this.props.pageView,
          this.props.location,
          this.props.scaleCorrection
        )}
        /*
         * Span should only be able to capture focus and key events if it is active.
         */
        tabIndex={this.props.active === true ? 0 : undefined}
        onClick={this.onClick}
        onKeyDown={this.props.onKeyDown}
      />
    );

    /*
     * If tooltip content was provided, wrap span in a tooltip component.
     */
    if (this.props.tooltipContent !== null) {
      span = (
        <MuiTooltip
          className="tooltip"
          open={this.props.active === true && this.props.selected}
          interactive
          disableHoverListener
          title={this.props.tooltipContent}
        >
          {span}
        </MuiTooltip>
      );
    }

    return span;
  }
}

export default AnnotationSpan;
