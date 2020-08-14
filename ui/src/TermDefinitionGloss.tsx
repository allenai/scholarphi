import React from "react";
import RichText from "./RichText";
import { Term } from "./types/api";

interface Props {
  term: Term;
}

export class TermDefinitionGloss extends React.PureComponent<Props> {
  render() {
    /*
     * Render the first definition.
     */
    const { term } = this.props;
    const definition =
      term.attributes.definition_texs[0] ||
      term.attributes.definitions[0] ||
      term.attributes.glossary_definitions[0];

    if (term.attributes.name === null) {
      return null;
    }

    return (
      <div className="gloss term-definition-gloss">
        <div className="gloss__section">
          {term.attributes.term_type === "symbol" ? (
            <RichText>{`$${term.attributes.name}$`}</RichText>
          ) : (
            <b>{term.attributes.name}</b>
          )}
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
