import React from "react";
import PaperSummary from "./PaperSummary";

interface CitationTooltipBodyProps {
  paperIds: string[];
}

export class CitationTooltipBody extends React.Component<CitationTooltipBodyProps, {}> {
  render() {
    return (
      <div className="summary-tooltip">
        {this.props.paperIds.map(paperId => {
          return <PaperSummary paperId={paperId} />;
        })}
      </div>
    );
  }
}

export default CitationTooltipBody;
