import React from "react";
import Annotation from "./Annotation";
import { Sentence } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

interface Props {
  pageView: PDFPageView;
  pageNumber: number;
  sentence: Sentence;
  id: string;
  active: boolean;
  selected: boolean;
  selectedSpanIds: string[] | null;
  handleSelect: (
    sentenceId: string,
    annotationId: string,
    annotationSpanId: string
  ) => void;
  handleShowSnackbarMessage: (message: string) => void;
}

export class SentenceAnnotation extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  onClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.altKey) {
      const { tex } = this.props.sentence.attributes;
      if (tex !== null) {
        navigator.clipboard.writeText(tex);
        const texPreview = uiUtils.truncateText(tex, 30, true);
        this.props.handleShowSnackbarMessage(
          `Copied LaTeX for sentence to clipboard: "${texPreview}"`
        );
      }
      /*
       * Tell the Annotation that the click event has been handled; don't select this sentence.
       */
      return true;
    }
  }

  handleSelect(annotationId: string, spanId: string) {
    this.props.handleSelect(this.props.sentence.id, annotationId, spanId);
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={this.props.id}
        className="sentence-annotation"
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanIds={this.props.selectedSpanIds}
        boundingBoxes={this.props.sentence.attributes.bounding_boxes}
        pageNumber={this.props.pageNumber}
        source={this.props.sentence.attributes.source}
        glossContent={null}
        /*
         * To avoid visual clutter, do not underline sentences. However, they should still be
         * interactable (i.e., hoverable, clickable).
         */
        underline={false}
        handleSelect={this.handleSelect}
        onClick={this.onClick}
      />
    );
  }
}

export default SentenceAnnotation;
