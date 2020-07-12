import React from "react";
import Annotation from "./Annotation";
import { BoundingBox, Sentence } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  pageView: PDFPageView;
  sentence: Sentence;
  id: string;
  boundingBoxes: BoundingBox[];
  active: boolean;
  selected: boolean;
  selectedSpanId: string | null;
  handleSelect: (id: string) => void;
  handleSelectSpan: (id: string) => void;
  handleSelectEntity: (id: string) => void;
}

export class SentenceAnnotation extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.onSelected = this.onSelected.bind(this);
  }

  onSelected() {
    this.props.handleSelectEntity(this.props.sentence.id);
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={this.props.id}
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        boundingBoxes={this.props.boundingBoxes}
        source={this.props.sentence.attributes.source}
        tooltipContent={null}
        /*
         * To avoid visual clutter, do not underline sentences. However, they should still be
         * interactable (i.e., hoverable, clickable) when rendered.
         */
        underline={false}
        handleSelectAnnotation={this.props.handleSelect}
        handleSelectAnnotationSpan={this.props.handleSelectSpan}
        onSelected={this.onSelected}
      />
    );
  }
}

export default SentenceAnnotation;
