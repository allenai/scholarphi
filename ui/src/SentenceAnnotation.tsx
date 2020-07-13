import React from "react";
import Annotation from "./Annotation";
import { BoundingBox, Sentence } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";
import * as uiUtils from "./utils/ui";

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
  handleShowSnackbarMessage: (message: string) => void;
}

export class SentenceAnnotation extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onSelected = this.onSelected.bind(this);
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

  onSelected() {
    this.props.handleSelectEntity(this.props.sentence.id);
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={this.props.id}
        className="sentence-annotation"
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        boundingBoxes={this.props.boundingBoxes}
        source={this.props.sentence.attributes.source}
        tooltipContent={null}
        /*
         * To avoid visual clutter, do not underline sentences. However, they should still be
         * interactable (i.e., hoverable, clickable).
         */
        underline={false}
        handleSelectAnnotation={this.props.handleSelect}
        handleSelectAnnotationSpan={this.props.handleSelectSpan}
        onSelected={this.onSelected}
        onClick={this.onClick}
      />
    );
  }
}

export default SentenceAnnotation;
