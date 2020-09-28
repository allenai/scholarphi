import classNames from "classnames";
import React from "react";
import { getRemoteLogger } from "./logging";
import { GlossStyle } from "./settings";
import Sidenote from "./Sidenote";
import Tooltip, { TooltipPlacement } from "./Tooltip";
import { BoundingBox } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

const logger = getRemoteLogger();

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
  /**
   * Where in the paper to draw this annotation span.
   */
  location: BoundingBox;
  glossContent: React.ReactNode | null;
  glossStyle: GlossStyle | null;
  tooltipPlacement?: TooltipPlacement;
  underline: boolean;
  /**
   * Correction factor to apply to bounding box coordinates before rendering the annotation.
   * While this was needed in past versions of the interface, at the time of this writing, the
   * data produced by the backend had been fixed such that this isn't necessary.
   * You shouldn't normally need to set this property.
   */
  scaleCorrection?: number;
  handleSelect: (spanId: string) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => boolean | void;
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

  onClick(e: React.MouseEvent<HTMLDivElement>) {
    let eventHandled = false;
    logger.log("debug", "clicked-annotation-span", {
      id: this.props.id,
      underlined: this.props.underline,
    });
    if (this.props.onClick !== undefined) {
      if (this.props.onClick(e) === true) {
        eventHandled = true;
      }
    }
    if (!eventHandled) {
      this.props.handleSelect(this.props.id);
    }
  }

  focusIfSelected(element: HTMLDivElement | null) {
    if (element !== null && this.props.selected) {
      element.focus();
    }
  }

  render() {
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
            underline: this.props.underline,
          }
        )}
        style={uiUtils.getPositionInPageView(
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
      ></div>
    );

    if (this.props.glossContent !== null) {
      if (this.props.glossStyle === "tooltip" && this.props.selected === true) {
        return (
          <>
            {span}
            <Tooltip
              pageView={this.props.pageView}
              anchor={this.props.location}
              content={this.props.glossContent}
              placement={this.props.tooltipPlacement}
            />
          </>
        );
      } else if (
        this.props.glossStyle === "sidenote" &&
        this.props.selected === true
      ) {
        return (
          <>
            {span}
            <Sidenote
              pageView={this.props.pageView}
              anchor={this.props.location}
              content={this.props.glossContent}
            />
          </>
        );
      }
    }

    return span;
  }
}

export default AnnotationSpan;
