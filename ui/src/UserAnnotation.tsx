import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import { ScholarReaderContext } from "./state";
import {
  Annotation as AnnotationObject,
  UserAnnotationType
} from "./types/api";
import UserAnnotationTooltipBody from "./UserAnnotationTooltipBody";

interface UserAnnotationProps {
  annotation: AnnotationObject;
  inactive?: boolean;
}

export class UserAnnotation extends React.PureComponent<UserAnnotationProps> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const { deleteUserAnnotation, updateUserAnnotation } = this.context;
    const ENTITY_TYPES_BY_KEY: { [key: string]: UserAnnotationType } = {
      c: "citation",
      e: "equation",
      s: "symbol"
    };
    if (e.key !== undefined) {
      if (e.key === "Backspace" || e.key === "Delete") {
        deleteUserAnnotation(this.props.annotation.id);
      } else if (ENTITY_TYPES_BY_KEY[e.key] !== undefined) {
        updateUserAnnotation(this.props.annotation.id, {
          ...this.props.annotation,
          type: ENTITY_TYPES_BY_KEY[e.key]
        });
      }
    }
  }

  render() {
    return (
      <Annotation
        id={`user-annotation-${this.props.annotation.id}`}
        inactive={this.props.inactive}
        className={classNames("user-annotation", {
          "citation-user-annotation": this.props.annotation.type === "citation",
          "symbol-user-annotation": this.props.annotation.type === "symbol",
          "equation-user-annotation": this.props.annotation.type === "equation"
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
