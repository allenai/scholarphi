import React from "react";
import RichText from "./RichText";
import { Term } from "./types/api";

interface Props {
  term: Term;
}

export class TermDefinitionGloss extends React.PureComponent<Props> {
  render() {
    /*
     * Render the first definition and source.
     */
    const { term } = this.props;
    const definition =
      term.attributes.definitions[0] || term.attributes.glossary_definitions[0];

    return (
      <div className="gloss term-definition-gloss">
        <div className="gloss__section">
          <b>{term.attributes.name}</b>
          {definition !== undefined ? (
            <>
              : <RichText>{definition}</RichText>
            </>
          ) : null}
        </div>
      </div>
    );
  }
}

export default TermDefinitionGloss;
