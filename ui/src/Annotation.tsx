import classNames from "classnames";
import React from "react";
import AnnotationSpan from "./AnnotationSpan";
import { BoundingBox } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

/**
 * Maximum height for an annotation span before it is filtered out as an outlier.
 */
const MAXIMUM_ANNOTATION_HEIGHT = 30;

interface AnnotationProps {
  pageView: PDFPageView;
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
  /**
   * When inactive, the annotation cannot be interacted with (i.e. clicked). Empty boxes will appear
   * in the places of each of the bounding boxes.
   */
  active?: boolean;
  selected?: boolean;
  selectedSpanId?: string | null;
  /**
   * Class name to apply to all spans that belong to this.
   */
  className?: string;
  /**
   * Positions in the paper where this annotation should be drawn. A separate 'AnnotationSpan'
   * will be created for each box.
   */
  boundingBoxes: BoundingBox[];
  /**
   * Whether to force the highlighting of this annotation.
   */
  highlight?: boolean;
  /**
   * Component to show in the tooltip when the annotation is activated.
   */
  tooltipContent: React.ReactNode | null;
  /**
   * Callback triggered when the annotation is selected. Most often, this is triggered when the
   * user clicks on an annotation.
   */
  onSelected?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleSelectAnnotation: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
}

export class Annotation extends React.PureComponent<AnnotationProps> {
  static defaultProps = {
    active: true,
    selected: false,
    highlight: false,
  };

  render() {
    return (
      <>
        {this.props.boundingBoxes
          .filter(
            (b) =>
              b.height < MAXIMUM_ANNOTATION_HEIGHT ||
              this.props.source === "other"
          )
          .map((box) => (
            <AnnotationSpan
              key={box.id}
              pageView={this.props.pageView}
              annotationId={this.props.id}
              id={box.id}
              active={this.props.active}
              location={box}
              className={classNames(this.props.className, {
                "source-tex-pipeline": this.props.source === "tex-pipeline",
                "source-other": this.props.source === "other",
                highlight: this.props.highlight,
              })}
              highlight={this.props.highlight}
              tooltipContent={this.props.tooltipContent}
              isAnnotationSelected={this.props.selected}
              isSpanSelected={this.props.selectedSpanId === box.id}
              onSelected={this.props.onSelected}
              onKeyDown={this.props.onKeyDown}
              handleSelectAnnotation={this.props.handleSelectAnnotation}
              handleSelectSpan={this.props.handleSelectAnnotationSpan}
            />
          ))}
      </>
    );
  }
}

export default Annotation;
