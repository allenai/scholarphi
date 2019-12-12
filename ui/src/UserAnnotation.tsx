import React from "react";
import Annotation from "./Annotation";
import { ScholarReaderContext } from "./state";
import { Annotation as AnnotationObject } from "./types/api";
import UserAnnotationTooltipBody from "./UserAnnotationTooltipBody";

interface UserAnnotationProps {
  annotation: AnnotationObject;
}

export class UserAnnotation extends React.Component<UserAnnotationProps> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const { deleteAnnotation, updateAnnotation } = this.context;
    if (e.key !== undefined) {
      if (e.key === "Backspace" || e.key === "Delete") {
        deleteAnnotation(this.props.annotation.id);
      } else if (e.key === "c") {
        updateAnnotation(this.props.annotation.id, {
          ...this.props.annotation,
          type: "citation"
        });
      } else if (e.key === "s") {
        updateAnnotation(this.props.annotation.id, {
          ...this.props.annotation,
          type: "symbol"
        });
      }
    }
  }

  onDeselect() {
    const { setSelectedAnnotation, selectedAnnotation } = this.context;
    if (
      selectedAnnotation !== null &&
      selectedAnnotation.id === this.props.annotation.id
    ) {
      setSelectedAnnotation(null);
    }
  }

  render() {
    let typeClass = "";
    if (this.props.annotation.type === "citation") {
      typeClass = "citation-user-annotation";
    } else if (this.props.annotation.type === "symbol") {
      typeClass = "symbol-user-annotation";
    }
    return (
      <ScholarReaderContext.Consumer>
        {({ selectedAnnotation }) => {
          return (
            <Annotation
              className={"user-annotation " + typeClass}
              location={this.props.annotation.boundingBox}
              tooltipContent={
                <UserAnnotationTooltipBody annotation={this.props.annotation} />
              }
              selected={
                selectedAnnotation !== null &&
                selectedAnnotation.id === this.props.annotation.id
              }
              onDeselected={this.onDeselect.bind(this)}
              onKeyDown={this.onKeyDown.bind(this)}
            />
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default UserAnnotation;
