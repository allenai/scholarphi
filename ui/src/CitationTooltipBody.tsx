import React from "react";
import PaperSummary from "./PaperSummary";
import * as api from "./types/api";

interface CitationTooltipBodyProps {
  paperId: string;
  citation: api.Citation;
}

export class CitationTooltipBody extends React.PureComponent<
  CitationTooltipBodyProps
> {
  render() {
    return (
      <div className="tooltip-body citation-tooltip-body">
        <div className="tooltip-body__section">
          <div className="tooltip-body__citation">
            <PaperSummary paperId={this.props.citation.paper} />
          </div>
        </div>
      </div>
    );
  }
}

export default CitationTooltipBody;
