import React from "react";
import { Author } from "./types/api";

interface Props {
  authors: Author[];
  showLinks?: boolean;
}

class AuthorList extends React.PureComponent<Props, {}> {
  render() {
    return (
      <span className="author-list">
        {this.props.authors.map((author, i) => {
          let textConnector;
          if (i === 0) {
            textConnector = "";
          } else if (i === this.props.authors.length - 1) {
            textConnector = " and ";
          } else {
            textConnector = ", ";
          }
          return (
            <span key={author.id || `author-${i}`}>
              {textConnector}
              {this.props.showLinks && author.url && author.name}
              {(!this.props.showLinks || author.url === null) && (
                <>{author.name}</>
              )}
            </span>
          );
        })}
      </span>
    );
  }
}

export default AuthorList;
