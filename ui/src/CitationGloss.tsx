import React from "react";
import PaperSummary from "./PaperSummary";
import { PaperId, UserLibrary } from "./state";
import { Citation, Paper } from "./types/api";

interface Props {
  paper: Paper;
  citation: Citation;
  userLibrary: UserLibrary | null;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  openedPaperId?: PaperId;
}

export class CitationGloss extends React.PureComponent<Props> {
  render() {
    return (
      <div className="gloss citation-gloss">
        <div className="gloss__section">
          <div className="gloss__citation">
            <PaperSummary
              paper={this.props.paper}
              userLibrary={this.props.userLibrary}
              handleAddPaperToLibrary={this.props.handleAddPaperToLibrary}
              openedPaperId={this.props.openedPaperId}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CitationGloss;
