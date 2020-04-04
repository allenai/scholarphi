import React from "react";
import { ScholarReaderContext } from "./state";
import { Citation as CitationObject } from "./types/api";
import { truncateText } from "./ui-utils";

interface CitationProperties {
  citation: CitationObject;
}

export class Citation extends React.PureComponent<CitationProperties> {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ papers, requestJumpToPaper, setSelectedEntity }) => {
          if (
            papers === null ||
            papers[this.props.citation.paper] === undefined
          ) {
            return (
              <div>
                <p>
                  Sorry, no bibliographic information could be found for this
                  citation. Help us find information for citations like this in
                  the future by clicking on the feedback button below.
                </p>
              </div>
            );
          } else {
            const paper = papers[this.props.citation.paper];
            return (
              <div className="citation">
                <p className="title">{paper.title}</p>
                {paper.authors.length > 0 && (
                  <>
                    by {paper.authors[0].name}{" "}
                    {paper.authors.length > 1 && " et al."}
                  </>
                )}
                {paper.abstract !== null ? (
                  <div className="citation__abstract">
                    {truncateText(paper.abstract, 400)}
                    <span
                      className="citation__abstract__sidebar-link"
                      onClick={() => {
                        requestJumpToPaper(this.props.citation.paper);
                      }}
                    >
                      (see more)
                    </span>
                  </div>
                ) : null}
              </div>
            );
          }
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default Citation;
