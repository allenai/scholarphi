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
  inactive?: boolean;
  /**
   * Class name to apply to all spans that belong to this
   */
  className?: string;
  /**
   * List of bounding boxes
   */
  boundingBoxes: BoundingBox[];
  shouldHighlight?: boolean;
  /**
   * Component to show in the tooltip when this annotation is activated.
   */
  tooltipContent: React.ReactNode | null;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export class Annotation extends React.PureComponent<AnnotationProps> {
  static defaultProps = {
    shouldHighlight: false
  };
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

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
              inactive={this.props.inactive}
              location={box}
              className={classNames(this.props.className, {
                "source-tex-pipeline": this.props.source === "tex-pipeline",
                "source-other": this.props.source === "other",
                "matching-symbol-annotation": this.props.shouldHighlight
              })}
              shouldHighlight={this.props.shouldHighlight}
              tooltipContent={this.props.tooltipContent}
              onKeyDown={this.props.onKeyDown}
            />
          ))}
      </>
    );
  }
}

export default Annotation;
