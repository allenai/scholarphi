import React from "react";
import S2Link from "./S2Link";
import { Author } from "./types/api";

interface AuthorListProps {
  authors: Author[];
}

class AuthorList extends React.Component<AuthorListProps, {}> {
  render() {
    return (
      <p className="citation-summary__authors">
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
              <S2Link url={author.url}>{author.name}</S2Link>
            </span>
          );
        })}
      </p>
    );
  }
}

export default AuthorList;
