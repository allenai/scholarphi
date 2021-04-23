import React from "react";
import PaperSummary from "./PaperSummary";
import { PaperId } from "../../../state";
import { Citation, Paper } from "../../../api/types";
import { VoteButton } from "../../common";
import { Nullable } from '../../../types/ui';
import { getPaper } from '../../../api/api';
import { LinearProgress } from "@material-ui/core";

interface Props {
  citation: Citation;
  lazyPapers: Map<string, Paper>;
  cachePaper: (paper: Paper, cb?: () => void) => void;
  evaluationEnabled?: boolean;
  openedPaperId?: PaperId;
}

interface State {
  error: Nullable<string>;
  isLoadingPaper: boolean;
}

export default class LazyCitationGloss extends React.PureComponent<Props, State> {
  state = {
    error: null,
    isLoadingPaper: false,
  };

  componentDidMount() {
    if (!!this.props.citation.attributes.paper_id) {
      const paperId = this.props.citation.attributes.paper_id;
      // Check the global cache at load time and request the paper if unavailable
      if (!this.props.lazyPapers.has(paperId)) {
        this.setState({ isLoadingPaper: true });
        getPaper(this.props.citation.attributes.paper_id).then(paper => {
          if (paper) {
            this.props.cachePaper(paper, () => {
              // Update component state as a callback after global state updates
              this.setState({
                isLoadingPaper: false,
              });
            });
          } else {
            // This should rarely be hit as failures
            // to fetch papers will throw and be caught below
            this.setState({
              error: 'Could not load paper data',
              isLoadingPaper: false,
            });
          }
        }).catch((err) => {
          this.setState({
            error: err?.message ? err.message : 'Could not load paper data',
            isLoadingPaper: false,
          });
        });
      }
    } else {
      this.setState({
        error: 'No paper data available',
      });
    }
  }

  render() {
    const { isLoadingPaper } = this.state;
    const noPaperComponent = isLoadingPaper ? (
      <div className="paper-summary">
        <div className="paper-summary__loading-msg">
          Loading...
        </div>
        <LinearProgress/>
      </div>
    ) : (
      <div className="paper-summary">
        <div className="paper-summary__loading-msg">
          Error
        </div>
        {this.state.error}
      </div>
    );

    const paper = this.props.lazyPapers.get(this.props.citation.attributes.paper_id || '');
    const paperComponent = !!paper ? (
      <PaperSummary
            paper={paper}
            openedPaperId={this.props.openedPaperId}
          />
    ) : noPaperComponent;

    return (
      <div className="gloss citation-gloss">
        <div className="gloss__section">
          {paperComponent}
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
