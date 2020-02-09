import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import { ScholarReaderContext } from "./state";
import { Annotation as AnnotationObject } from "./types/api";
import UserAnnotationTooltipBody from "./UserAnnotationTooltipBody";

interface UserAnnotationProps {
  annotation: AnnotationObject;
}

export class UserAnnotation extends React.PureComponent<UserAnnotationProps> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const { deleteUserAnnotation, updateUserAnnotation } = this.context;
    if (e.key !== undefined) {
      if (e.key === "Backspace" || e.key === "Delete") {
        deleteUserAnnotation(this.props.annotation.id);
      } else if (e.key === "c") {
        updateUserAnnotation(this.props.annotation.id, {
          ...this.props.annotation,
          type: "citation"
        });
      } else if (e.key === "s") {
        updateUserAnnotation(this.props.annotation.id, {
          ...this.props.annotation,
          type: "symbol"
        });
      }
    }
  }

  render() {
    return (
      <Annotation
        id={`user-annotation-${this.props.annotation.id}`}
        className={classNames("user-annotation", {
          "citation-user-annotation": this.props.annotation.type === "citation",
          "symbol-user-annotation": this.props.annotation.type === "symbol"
        })}
        boundingBoxes={[this.props.annotation.boundingBox]}
        tooltipContent={
          <UserAnnotationTooltipBody annotation={this.props.annotation} />
        }
        onKeyDown={this.onKeyDown.bind(this)}
      />
    );
  }
}

export default UserAnnotation;
