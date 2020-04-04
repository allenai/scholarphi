import React from "react";
import PaperSummary from "./PaperSummary";
import { ScholarReaderContext } from "./state";

export class PaperList extends React.PureComponent {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ papers }) =>
          papers !== null ? (
            <div className="paper-list">
              {Object.keys(papers).map(paperId => (
                <PaperSummary key={paperId} paperId={paperId} />
              ))}
            </div>
          ) : (
            <p>Information for cited papers is not yet loaded.</p>
          )
        }
      </ScholarReaderContext.Consumer>
    );
  }
}

export default PaperList;
