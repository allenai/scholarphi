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
        {({ papers, setJumpPaperId, setSelectedCitation }) => {
          const paper = papers[this.props.citation.paper];
          if (paper === undefined) {
            return (
              <div>
                Sorry, we currently don't have any linked information for this paper yet.<br></br>
                Let us know what went wrong by clicking on the icon below, so we could provide 
                you with better reading experience in the future!
              </div>
            )
          } else {
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
                        setSelectedCitation(this.props.citation);
                        setJumpPaperId(this.props.citation.paper);
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
