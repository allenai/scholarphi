import React from "react";
import Annotation from "./Annotation";
import CitationTooltipBody from "./CitationTooltipBody";
import { PaperId, UserLibrary } from "./state";
import { Citation, Paper } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  pageView: PDFPageView;
  pageNumber: number;
  paper: Paper | null;
  userLibrary: UserLibrary | null;
  citation: Citation;
  id: string;
  active: boolean;
  selected: boolean;
  selectedSpanId: string | null;
  /**
   * The ID of the paper that the user is reading.
   */
  openedPaperId?: PaperId;
  handleSelect: (
    citationId: string,
    annotationId: string,
    annotationSpanId: string
  ) => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
}

export class CitationAnnotation extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(annotationId: string, spanId: string) {
    this.props.handleSelect(this.props.citation.id, annotationId, spanId);
  }

  render() {
    return (
      <Annotation
        pageView={this.props.pageView}
        id={this.props.id}
        className="citation-annotation"
        active={this.props.active}
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        boundingBoxes={this.props.citation.attributes.bounding_boxes}
        pageNumber={this.props.pageNumber}
        source={this.props.citation.attributes.source}
        tooltipContent={
          this.props.paper !== null ? (
            <CitationTooltipBody
              citation={this.props.citation}
              paper={this.props.paper}
              userLibrary={this.props.userLibrary}
              handleAddPaperToLibrary={this.props.handleAddPaperToLibrary}
              openedPaperId={this.props.openedPaperId}
            />
          ) : null
        }
        handleSelect={this.handleSelect}
      />
    );
  }
}

export default CitationAnnotation;
