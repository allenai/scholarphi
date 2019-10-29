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
            <div className="citation-tooltip">
              <p className="citation-tooltip__title">{paper.title}</p>
              <p className="citation-tooltip__authors">
                {authorNamesList && (
                  <p>
                    <i className="authors">{authorNamesList}</i>
                  </p>
                )}
              </p>
              <p className="citation-tooltip__abstract">{paper.abstract}</p>
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
