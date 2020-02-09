import React from "react";
import Citation from "./Citation";
import FeedbackButton from "./FeedbackButton";
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
            <Citation citation={this.props.citation} />
          </div>
        </div>
        <div className="tooltip-body__section">
          Give feedback on this tooltip
          <FeedbackButton
            extraContext={{ citationId: this.props.citation.id }}
          />
        </div>
      </div>
    );
  }
}

export default CitationTooltipBody;
