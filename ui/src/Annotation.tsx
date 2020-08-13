import classNames from "classnames";
import React from "react";
import AnnotationSpan from "./AnnotationSpan";
import { GlossStyle } from "./settings";
import { BoundingBox } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

interface Props {
  /*
   * This component will render only those bounding boxes for the specified page. The parent
   * component is encouraged *not* to filter bounding boxes before passing them as properties to
   * this component, instead letting this component do the filtering of boxes. This is for
   * performance reasons. If a parent is required to filter the bounding
   * boxes for an annotation, the annotation will get passed a new set of bounding boxes each time
   * the parent re-renders, which would trigger an unwanted re-render of this component. Instead,
   * this filter lets the annotation take in the same list of bounding boxes every time,
   * preventing an unnecessary re-render of what will be hundreds of annotations.
   */
  pageView: PDFPageView;
  /**
   * A unique ID that distinguishes this annotation from all other annotations.
   */
  id: string;
  /**
   * Class name to apply to all spans that belong to this.
   */
  className?: string;
  /**
   * When active, an annotation can be interacted with. Visual effects will show to indicate that
   * the annotation can be interacted with (e.g., underlines, and highlights that appear on hover).
   * If not active, an annotation can still be highlighted
   */
  active?: boolean;
  /**
   * Whether the current annotation is currently selected.
   */
  selected?: boolean;
  /**
   * If the annotation is selected, this is the ID of the span of the annotation that was selected.
   * This ensures that the tooltip will show right next to where the user clicked. IDs for spans that
   * do not belong to this annotation are ignored.
   */
  selectedSpanIds: string[] | null;
  /**
   * Positions in the paper where this annotation should be drawn. A separate 'AnnotationSpan'
   * will be created for each box.
   */
  boundingBoxes: BoundingBox[];
  /**
   * Whether this annotation represents a matched entity in a Ctrl+F search.
   */
  isFindMatch?: boolean;
  /**
   * Whether this annotation represents the currently selected matched entity in a Ctrl+F search.
   */
  isFindSelection?: boolean;
  /**
   * Component to show in a gloss when the annotation is activated.
   */
  glossContent?: React.ReactNode | null;
  /**
   * Style of glossary to show (e.g., tooltip, sidenote, etc.). Set to null if no glosses should
   * be shown for this annotation.
   */
  glossStyle?: GlossStyle | null;
  /**
   * Whether to show an underline hint beneath the annotation. Defaults to true.
   */
  underline?: boolean;
  /**
   * The data source that detected the annotated entity. This property should
   * be used for development purposes only. Production features and styles should not rely on this
   * property. It is provided to help developers visualize and compare the results of
   * different methods for detecting entities.
   */
  source?: string;
  handleSelect: (id: string, spanId: string) => void;
  /**
   * Callback triggered when the annotation has been clicked. First argument is the event, where
   * 'currentTarget' is the 'div' element for the AnnotationSpan that was clicked. The return
   * value can be used to indicate whether the click event is 'handled' and whether the default
   * behavior (selecting the annotation) should be prevented. Return 'true' to suppress the default
   * behavior.
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void | boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export class Annotation extends React.PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    active: true,
    selected: false,
    isFindMatch: false,
    isFindSelection: false,
    underline: true,
    glossStyle: null,
    glossContent: null,
  };

  constructor(props: Props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(spanId: string) {
    this.props.handleSelect(this.props.id, spanId);
  }

  render() {
    return (
      <div
        className={classNames("scholar-reader-annotation", {
          selected: this.props.selected,
        })}
      >
        {this.props.boundingBoxes
          .filter((b) => {
            /**
             * Annotations taller than this height are considered outliers.
             */
            const MAXIMUM_ANNOTATION_HEIGHT = 30;
            return (
              (b.height < MAXIMUM_ANNOTATION_HEIGHT ||
                this.props.source === "other") &&
              b.page === uiUtils.getPageNumber(this.props.pageView)
            );
          })
          .map((box, i) => {
            const spanId = `${this.props.id}-span-${i}`;
            return (
              <AnnotationSpan
                key={spanId}
                id={spanId}
                pageView={this.props.pageView}
                className={classNames(this.props.className, {
                  "annotation-selected": this.props.selected,
                  "find-match": this.props.isFindMatch,
                  "find-selection": this.props.isFindSelection,
                  "source-tex-pipeline": this.props.source === "tex-pipeline",
                  "source-other": this.props.source === "other",
                })}
                active={this.props.active}
                location={box}
                selected={
                  this.props.selectedSpanIds !== null &&
                  this.props.selectedSpanIds.indexOf(spanId) !== -1
                }
                glossContent={this.props.glossContent}
                glossStyle={this.props.glossStyle}
                underline={this.props.underline}
                onClick={this.props.onClick}
                onKeyDown={this.props.onKeyDown}
                handleSelect={this.handleSelect}
              />
            );
          })}
      </div>
    );
  }
}

export default Annotation;
