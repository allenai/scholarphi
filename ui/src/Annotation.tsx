import classNames from "classnames";
import React from "react";
import AnnotationSpan from "./AnnotationSpan";
import { BoundingBox } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
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
  selected?: boolean;
  /**
   * If the annotation is selected, this is the ID of the span of the annotation that was selected.
   * This ensures that the tooltip will show right next to where the user clicked.
   */
  selectedSpanId?: string | null;
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
   * Component to show in the tooltip when the annotation is activated.
   */
  tooltipContent: React.ReactNode | null;
  /**
   * The data source that detected the annotated entity. This property should
   * be used for development purposes only. Production features and styles should not rely on this
   * property. It is provided to help developers visualize and compare the results of
   * different methods for detecting entities.
   */
  source?: string;
  handleSelectAnnotation: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
  /**
   * Callback triggered when the annotation is selected. Most often, this is triggered when the
   * user clicks on an annotation.
   */
  onSelected?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export class Annotation extends React.PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    active: true,
    selected: false,
    isFindMatch: false,
    isFindSelection: false,
  };

  constructor(props: Props) {
    super(props);
    this.handleSelection = this.handleSelection.bind(this);
  }

  handleSelection(spanId: string) {
    this.props.handleSelectAnnotation(this.props.id);
    this.props.handleSelectAnnotationSpan(spanId);
    if (this.props.onSelected !== undefined) {
      this.props.onSelected();
    }
  }

  render() {
    return (
      <>
        {this.props.boundingBoxes
          .filter((b) => {
            /**
             * Annotations taller than this height are considered outliers.
             */
            const MAXIMUM_ANNOTATION_HEIGHT = 30;
            return (
              b.height < MAXIMUM_ANNOTATION_HEIGHT ||
              this.props.source === "other"
            );
          })
          .map((box) => (
            <AnnotationSpan
              key={box.id}
              id={box.id}
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
              selected={this.props.selectedSpanId === box.id}
              tooltipContent={this.props.tooltipContent}
              onKeyDown={this.props.onKeyDown}
              handleSelection={this.handleSelection}
            />
          ))}
      </>
    );
  }
}

export default Annotation;
