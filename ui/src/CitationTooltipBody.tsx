import React from "react";
import Citation from "./Citation";
import FeedbackButton from "./FeedbackButton";
import { ScholarReaderContext } from "./state";
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
        <div className="tooltip-body__section tooltip-body__label tooltip-body__header">
          <div className="tooltip-body__label">
            This citation was matched to {this.props.paperId.length}
            {this.props.paperId.length > 1 ? " papers" : " paper"}:
          </div>
          <FeedbackButton
            extraContext={{ citationId: this.props.citation.id }}
          />
        </div>
        <div className="tooltip-body__section">
          <ScholarReaderContext.Consumer>
            {({ setDrawerState, setJumpPaperId, setSelectedCitation }) => (
              <div
                className="tooltip-body__citation"
                onClick={() => {
                  setSelectedCitation(this.props.citation);
                  setDrawerState("show-citations");
                  setJumpPaperId(this.props.paperId);
                }}
              >
                <Citation paperId={this.props.paperId} />
              </div>
            )}
          </ScholarReaderContext.Consumer>
        </div>
      </div>
    );
  }
}

export default CitationTooltipBody;
