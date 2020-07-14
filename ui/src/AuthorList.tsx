import React from "react";
import S2Link from "./S2Link";
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
            <span key={author.id}>
              {textConnector}
              {this.props.showLinks && (
                <S2Link url={author.url}>{author.name}</S2Link>
              )}
              {!this.props.showLinks && <>{author.name}</>}
            </span>
          );
        })}
      </span>
    );
  }
}

export default AuthorList;
