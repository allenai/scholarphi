import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import { KnownEntityType } from "./state";
import { Entity, EntityUpdateData } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import UserAnnotationTooltipBody from "./UserAnnotationTooltipBody";

interface Props {
  pageView: PDFPageView;
  entity: Entity;
  active: boolean;
  selected: boolean;
  selectedSpanId: string | null;
  handleSelectAnnotation: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
  handleUpdateEntity: (data: EntityUpdateData) => void;
  handleDeleteEntity: (id: string) => void;
}

export class UserAnnotation extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const { handleUpdateEntity, handleDeleteEntity } = this.props;
    const ENTITY_TYPES_BY_KEY: { [key: string]: KnownEntityType } = {
      c: "citation",
      e: "equation",
      s: "symbol",
    };
    if (e.key !== undefined) {
      if (e.key === "Backspace" || e.key === "Delete") {
        handleDeleteEntity(this.props.entity.id);
      } else if (ENTITY_TYPES_BY_KEY[e.key] !== undefined) {
        handleUpdateEntity({
          id: this.props.entity.id,
          type: ENTITY_TYPES_BY_KEY[e.key],
          attributes: {
            source: "human-annotation",
          },
        });
      }
    }
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={`user-annotation-${this.props.entity.id}`}
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        className={classNames("user-annotation", {
          "citation-user-annotation": this.props.entity.type === "citation",
          "symbol-user-annotation": this.props.entity.type === "symbol",
          "equation-user-annotation": this.props.entity.type === "equation",
        })}
        boundingBoxes={this.props.entity.attributes.bounding_boxes}
        tooltipContent={
          <UserAnnotationTooltipBody
            entity={this.props.entity}
            handleUpdateEntity={this.props.handleUpdateEntity}
            handleDeleteEntity={this.props.handleDeleteEntity}
          />
        }
        onKeyDown={this.onKeyDown}
        handleSelectAnnotation={this.props.handleSelectAnnotation}
        handleSelectAnnotationSpan={this.props.handleSelectAnnotationSpan}
      />
    );
  }
}

export default UserAnnotation;
