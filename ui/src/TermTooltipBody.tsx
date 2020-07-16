import React from "react";
import { Term } from "./types/api";

interface Props {
  term: Term;
}

export class TermTooltipBody extends React.PureComponent<Props> {
  render() {
    /*
     * Render the first definition and source.
     */
    const { term } = this.props;
    const definition = term.attributes.glossary_definitions[0];
    if (definition === undefined) {
      return null;
    }

    return (
      <div className="tooltip-body term-tooltip-body">
        <div className="tooltip-body__section">
          <p>
            <b>{term.attributes.name}</b>: {definition}
          </p>
        </div>
      </div>
    );
  }
}

export default TermTooltipBody;
