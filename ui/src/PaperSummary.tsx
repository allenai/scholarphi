import React from "react";
import AuthorList from "./AuthorList";
import S2Link from "./S2Link";
import { ScholarReaderContext } from "./state";

interface PaperSummaryProps {
  paperId: string;
}

export class PaperSummary extends React.Component<PaperSummaryProps, {}> {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ papers }) => {
          const paper = papers[this.props.paperId];
          return (
            <div className="citation-summary">
              <div className="citation-summary__section">
                <p className="citation-summary__title">
                  <S2Link url={paper.url}>{paper.title}</S2Link>
                </p>
                {paper.authors.length > 0 && (
                  <AuthorList authors={paper.authors} />
                )}
              </div>
              <div className="citation-summary__section">
                <p className="citation-summary__abstract">{paper.abstract}</p>
              </div>
            </div>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default PaperSummary;
