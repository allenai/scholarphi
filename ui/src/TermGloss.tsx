import React from "react";
import LatexPreview from "./LatexPreview";
import { Term } from "./types/api";

interface Props {
  term: Term;
}

export class TermGloss extends React.PureComponent<Props> {
  render() {
    /*
     * Render the first definition and source.
     */
    const { term } = this.props;
    const definition =
      term.attributes.definitions[0] || term.attributes.glossary_definitions[0];

    return (
      <div className="gloss term-gloss">
        <div className="gloss__section">
          <p>
            <b>{term.attributes.name}</b>
            {definition !== undefined ? (
              <>
                : <LatexPreview latex={definition} />
              </>
            ) : null}
          </p>
        </div>
      </div>
    );
  }
}

export default TermGloss;
