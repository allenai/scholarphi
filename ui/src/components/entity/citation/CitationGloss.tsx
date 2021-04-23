import React from "react";
import PaperSummary from "./PaperSummary";
import { PaperId } from "../../../state";
import { Citation, Paper } from "../../../api/types";
import { VoteButton } from "../../common";

interface Props {
  paper: Paper;
  citation: Citation;
  openedPaperId?: PaperId;
  evaluationEnabled?: boolean;
}

export class CitationGloss extends React.PureComponent<Props> {
  render() {
    return (
      <div className="gloss citation-gloss">
        <div className="gloss__section">
          <PaperSummary
            paper={this.props.paper}
            openedPaperId={this.props.openedPaperId}
          />
        </div>
        {this.props.evaluationEnabled ? (
          <div className="citation-gloss__vote-button">
            <VoteButton
              context={{
                citation: this.props.citation,
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default CitationGloss;
