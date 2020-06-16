import React from "react";
import PaperSummary from "./PaperSummary";
import { PaperId } from "./state";
import { Citation, Paper, UserLibrary } from "./types/api";

interface CitationTooltipBodyProps {
  paper: Paper;
  citation: Citation;
  userLibrary: UserLibrary | null;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  openedPaperId?: PaperId;
}

export class CitationTooltipBody extends React.PureComponent<
  CitationTooltipBodyProps
> {
  render() {
    return (
      <div className="tooltip-body citation-tooltip-body">
        <div className="tooltip-body__section">
          <div className="tooltip-body__citation">
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

export default CitationTooltipBody;
