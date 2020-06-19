import React from "react";
import Annotation from "./Annotation";
import CitationTooltipBody from "./CitationTooltipBody";
import { PaperId } from "./state";
import { BoundingBox, Citation, Paper, UserLibrary } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  pageView: PDFPageView;
  paper: Paper;
  userLibrary: UserLibrary | null;
  citation: Citation;
  active: boolean;
  selected: boolean;
  selectedSpanId: string | null;
  /**
   * The ID of the paper that the user is reading.
   */
  openedPaperId?: PaperId;
  boundingBoxes: BoundingBox[];
  handleSelectAnnotation: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
  handleSelectCitation: (id: string) => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
}

export class CitationAnnotation extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.onSelected = this.onSelected.bind(this);
  }

  onSelected() {
    this.props.handleSelectCitation(this.props.citation.id);
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={`citation-${this.props.citation.id}-annotation`}
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        boundingBoxes={this.props.boundingBoxes}
        source={this.props.citation.source}
        tooltipContent={
          <CitationTooltipBody
            citation={this.props.citation}
            paper={this.props.paper}
            userLibrary={this.props.userLibrary}
            handleAddPaperToLibrary={this.props.handleAddPaperToLibrary}
            openedPaperId={this.props.openedPaperId}
          />
        }
        handleSelectAnnotation={this.props.handleSelectAnnotation}
        handleSelectAnnotationSpan={this.props.handleSelectAnnotationSpan}
        onSelected={this.onSelected}
      />
    );
  }
}

export default CitationAnnotation;
