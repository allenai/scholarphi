import React from "react";
import { ScholarReaderContext } from "./state";

interface PaperPreviewProps {
  paperId: string;
}

export class PaperPreview extends React.Component<PaperPreviewProps, {}> {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {state => {
          const paper = state.papers[this.props.paperId];
          const authorNamesList = joinAuthorNames(...paper.authors.map(a => a.name));
          return (
            <div className="citation-summary">
              <div className="citation-summary__section">
                <p className="citation-summary__title">{paper.title}</p>
                <p className="citation-summary__authors">
                  {authorNamesList && <span>{authorNamesList}</span>}
                </p>
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

function joinAuthorNames(...authors: string[]): string | null {
  if (authors.length === 0) {
    return null;
  } else if (authors.length === 1) {
    return authors[0];
  } else if (authors.length === 2) {
    return authors[0] + " and " + authors[1];
  } else if (authors.length > 2) {
    return authors.slice(0, authors.length - 1).join(", ") + " and " + authors[authors.length - 1];
  }
  return null;
}

export default PaperPreview;
