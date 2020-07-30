import React from "react";
import Annotation from "./Annotation";
import { GlossStyle } from "./settings";
import { Entity } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  className?: string;
  id: string;
  pageView: PDFPageView;
  pageNumber: number;
  entity: Entity;
  active?: boolean;
  underline?: boolean;
  selected?: boolean;
  isFindMatch?: boolean;
  isFindSelection?: boolean;
  selectedSpanIds: string[] | null;
  glossStyle?: GlossStyle;
  glossContent?: React.ReactNode;
  handleSelect?: (
    entityId: string,
    annotationId: string,
    annotationSpanId: string
  ) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>, entity: Entity) => void;
}

class EntityAnnotation extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  handleSelect(annotationId: string, spanId: string) {
    if (this.props.handleSelect !== undefined) {
      this.props.handleSelect(this.props.entity.id, annotationId, spanId);
    }
  }

  onClick(event: React.MouseEvent<HTMLDivElement>) {
    if (this.props.onClick !== undefined) {
      this.props.onClick(event, this.props.entity);
    }
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={this.props.id}
        className={this.props.className}
        active={this.props.active}
        underline={this.props.underline}
        selected={this.props.selected}
        selectedSpanIds={this.props.selectedSpanIds}
        boundingBoxes={this.props.entity.attributes.bounding_boxes}
        pageNumber={this.props.pageNumber}
        source={this.props.entity.attributes.source}
        glossStyle={this.props.glossStyle}
        glossContent={this.props.glossContent}
        handleSelect={this.handleSelect}
        onClick={this.onClick}
      />
    );
  }
}

export default EntityAnnotation;
