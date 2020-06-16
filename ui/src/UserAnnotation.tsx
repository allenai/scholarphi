import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import {
  Annotation as AnnotationObject,
  UserAnnotationType,
} from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import UserAnnotationTooltipBody from "./UserAnnotationTooltipBody";

interface Props {
  pageView: PDFPageView;
  annotation: AnnotationObject;
  active?: boolean;
  selected: boolean;
  selectedSpanId: string | null;
  handleUpdateAnnotation: (id: string, annotation: AnnotationObject) => void;
  handleDeleteAnnotation: (id: string) => void;
  handleSelectAnnotation: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
}

export class UserAnnotation extends React.PureComponent<Props> {
  static defaultProps = {
    active: true,
  };

  constructor(props: Props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const { handleUpdateAnnotation, handleDeleteAnnotation } = this.props;
    const ENTITY_TYPES_BY_KEY: { [key: string]: UserAnnotationType } = {
      c: "citation",
      e: "equation",
      s: "symbol",
    };
    if (e.key !== undefined) {
      if (e.key === "Backspace" || e.key === "Delete") {
        handleDeleteAnnotation(this.props.annotation.id);
      } else if (ENTITY_TYPES_BY_KEY[e.key] !== undefined) {
        handleUpdateAnnotation(this.props.annotation.id, {
          ...this.props.annotation,
          type: ENTITY_TYPES_BY_KEY[e.key],
        });
      }
    }
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={`user-annotation-${this.props.annotation.id}`}
        active={this.props.active}
        className={classNames("user-annotation", {
          "citation-user-annotation": this.props.annotation.type === "citation",
          "symbol-user-annotation": this.props.annotation.type === "symbol",
          "equation-user-annotation": this.props.annotation.type === "equation",
        })}
        boundingBoxes={[this.props.annotation.boundingBox]}
        tooltipContent={
          <UserAnnotationTooltipBody
            annotation={this.props.annotation}
            handleUpdateAnnotation={this.props.handleUpdateAnnotation}
            handleDeleteAnnotation={this.props.handleDeleteAnnotation}
          />
        }
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        onKeyDown={this.onKeyDown}
        handleSelectAnnotation={this.props.handleSelectAnnotation}
        handleSelectAnnotationSpan={this.props.handleSelectAnnotationSpan}
      />
    );
  }
}

export default UserAnnotation;
