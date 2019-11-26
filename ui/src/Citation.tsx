import React from "react";
import AuthorList from "./AuthorList";
import { ScholarReaderContext } from "./state";

interface CitationProperties {
  paperId: string;
}

export class Citation extends React.Component<CitationProperties> {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ papers }) => {
          const paper = papers[this.props.paperId];
          return (
            <div className="citation">
              <p className="title">{paper.title}</p>
              {paper.authors.length > 0 && (
                <>
                  by <AuthorList authors={paper.authors} />
                </>
              )}
            </div>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default Citation;
