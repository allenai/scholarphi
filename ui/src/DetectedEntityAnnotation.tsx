import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import { DetectedEntity } from "./detected-boxes";
import { ScholarReaderContext } from "./state";

interface DetectedEntityAnnotationProps {
  entity: DetectedEntity;
  boxNumber: number;
}

export class DetectedEntityAnnotation extends React.PureComponent<
  DetectedEntityAnnotationProps
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  render() {
    return (
      <Annotation
        id={`entity-annotation-${this.props.entity.arxivId}-${this.props.entity.page}-${this.props.entity.index}-${this.props.boxNumber}`}
        className={classNames("detected-entity-annotation", {
          "citation-entity-annotation": this.props.entity.type === "citation",
          "symbol-entity-annotation": this.props.entity.type === "symbol"
        })}
        // scaleCorrection={0.9975}
        location={{
          ...this.props.entity.rectangles[this.props.boxNumber],
          page: this.props.entity.page
        }}
        tooltipContent={
          <div>
            Index: {this.props.entity.index}, Bounding box #:{" "}
            {this.props.boxNumber}, IOU: {this.props.entity.iou}, Total boxes
            for entity: {this.props.entity.rectangles.length}
          </div>
        }
      />
    );
  }
}

export default DetectedEntityAnnotation;
