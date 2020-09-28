import React from "react";
import RichText from "./RichText";
import { Term } from "./types/api";

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
