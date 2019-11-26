import React from "react";
import AuthorList from "./AuthorList";
import S2Link from "./S2Link";
import { ScholarReaderContext } from "./state";

const TRUNCATED_ABSTRACT_LENGTH = 300;

interface PaperSummaryProps {
  paperId: string;
}

interface PaperSummaryState {
  showFullAbstract: boolean;
}

export class PaperSummary extends React.Component<
  PaperSummaryProps,
  PaperSummaryState
> {
  constructor(props: PaperSummaryProps) {
    super(props);
    this.state = {
      showFullAbstract: false
    };
  }

  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ papers }) => {
          const paper = papers[this.props.paperId];
          return (
            <div className="paper-summary">
              <div className="paper-summary__section">
                <p className="paper-summary__title">
                  <S2Link url={paper.url}>{paper.title}</S2Link>
                </p>
                <p>
                  {paper.authors.length > 0 && (
                    <AuthorList showLinks authors={paper.authors} />
                  )}
                </p>
                {paper.year !== null && (
                  <p className="paper-summary__year">{paper.year}</p>
                )}
              </div>
              {paper.abstract !== null && (
                <div className="paper-summary__section">
                  <p className="paper-summary__abstract">
                    {this.state.showFullAbstract ||
                    paper.abstract.length < TRUNCATED_ABSTRACT_LENGTH ? (
                      paper.abstract
                    ) : (
                      <>
                        {paper.abstract.substr(0, TRUNCATED_ABSTRACT_LENGTH) +
                          "..."}
                        <span
                          className="paper-summary__abstract__show-more-label"
                          onClick={() => {
                            this.setState({ showFullAbstract: true });
                          }}
                        >
                          (show more)
                        </span>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default PaperSummary;
