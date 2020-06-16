import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import CitationTooltipBody from "./CitationTooltipBody";
import { PaperId } from "./state";
import { BoundingBox, Citation, Paper, UserLibrary } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface Props {
  pageView: PDFPageView;
  citation: Citation;
  paper: Paper;
  userLibrary: UserLibrary | null;
  boundingBoxes: BoundingBox[];
  selected: boolean;
  selectedSpanId: string | null;
  showHint?: boolean;
  openedPaperId?: PaperId;
  handleSelectCitation: (id: string) => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  handleSelectAnnotation: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
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
        className={classNames({ "annotation-hint": this.props.showHint })}
        source={this.props.citation.source}
        boundingBoxes={this.props.boundingBoxes}
        tooltipContent={
          <CitationTooltipBody
            citation={this.props.citation}
            paper={this.props.paper}
            userLibrary={this.props.userLibrary}
            handleAddPaperToLibrary={this.props.handleAddPaperToLibrary}
            openedPaperId={this.props.openedPaperId}
          />
        }
        selected={this.props.selected}
        selectedSpanId={this.props.selectedSpanId}
        onSelected={this.onSelected}
        handleSelectAnnotation={this.props.handleSelectAnnotation}
        handleSelectAnnotationSpan={this.props.handleSelectAnnotationSpan}
      />
    );
  }
}

export default CitationAnnotation;
