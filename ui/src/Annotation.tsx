import classNames from "classnames";
import React from "react";
import AnnotationSpan from "./AnnotationSpan";
import { ScholarReaderContext } from "./state";
import { BoundingBox } from "./types/api";

/**
 * Maximum height for an annotation span before it is filtered out as an outlier.
 */
const MAXIMUM_ANNOTATION_HEIGHT = 30;

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
  /**
   * When inactive, the annotation cannot be interacted with (i.e. clicked). Empty boxes will appear
   * in the places of each of the bounding boxes.
   */
  active?: boolean;
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
  onSelected?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export class Annotation extends React.PureComponent<AnnotationProps> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  static defaultProps = {
    active: true,
    highlight: false
  };

  render() {
    return (
      <>
        {this.props.boundingBoxes
          .filter(
            b =>
              b.height < MAXIMUM_ANNOTATION_HEIGHT ||
              this.props.source === "other"
          )
          .map(box => (
            <AnnotationSpan
              key={box.id}
              annotationId={this.props.id}
              id={box.id}
              active={this.props.active}
              location={box}
              className={classNames(this.props.className, {
                "source-tex-pipeline": this.props.source === "tex-pipeline",
                "source-other": this.props.source === "other",
                "matching-symbol-annotation": this.props.highlight
              })}
              highlight={this.props.highlight}
              tooltipContent={this.props.tooltipContent}
              onSelected={this.props.onSelected}
              onKeyDown={this.props.onKeyDown}
            />
          ))}
      </>
    );
  }
}

export default Annotation;
