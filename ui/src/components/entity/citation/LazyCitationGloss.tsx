import React from "react";
import PaperSummary from "./PaperSummary";
import { PaperId, UserLibrary } from "../../../state";
import { Citation, Paper } from "../../../api/types";
import { VoteButton } from "../../common";
import { Nullable } from '../../../types/ui';
import { getPaper } from '../../../api/api';
import { LinearProgress } from "@material-ui/core";
import { AxiosError } from "axios";

interface Props {
  citation: Citation;
  evaluationEnabled?: boolean;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  openedPaperId?: PaperId;
  userLibrary: Nullable<UserLibrary>;
}

interface State {
  error: Nullable<string>;
  isLoadingPaper: boolean;
  paper: Nullable<Paper>;
}

export default class LazyCitationGloss extends React.PureComponent<Props, State> {
  state = {
    error: null,
    isLoadingPaper: false,
    paper: null,
  };

  componentDidMount() {
    if (!!this.props.citation.attributes.paper_id) {
      this.setState({ isLoadingPaper: true });
      getPaper(this.props.citation.attributes.paper_id).then(paper => {
        this.setState({
          paper,
          isLoadingPaper: false,
        });
      }).catch((err: AxiosError /* Fairly sure this is the type, though AxiosPromise gets abstracted away */) => {
        this.setState({
          error: err?.message ? err.message : 'Could not load paper data',
        });
      });
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

    // @ts-ignore why is this resolving to null?!
    const paper: Paper = this.state.paper;
    const paperComponent = !!paper ? (
      <PaperSummary
            paper={paper}
            userLibrary={this.props.userLibrary}
            handleAddPaperToLibrary={this.props.handleAddPaperToLibrary}
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
