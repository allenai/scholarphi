import { RichText } from "../common";
import { Term } from "../../api/types";

import React from "react";

interface Props {
  term: Term;
}

export class TermFindQueryWidget extends React.PureComponent<Props> {
  render() {
    const { term } = this.props;
    return (
      <div>
        <span className="find-bar__message__span">
          Find other appearances of{" "}
          <RichText>{term.attributes.name || "term"}</RichText>
        </span>
      </div>
    );
  }
}

export default TermFindQueryWidget;
