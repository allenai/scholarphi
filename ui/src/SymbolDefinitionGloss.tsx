import React from "react";
import LatexPreview from "./LatexPreview";
import { Symbol } from "./types/api";

interface Props {
  symbol: Symbol;
}

class SymbolDefinitionGloss extends React.PureComponent<Props> {
  render() {
    const { symbol } = this.props;
    const {
      tex,
      nicknames,
      definitions,
      defining_formulas,
      passages,
    } = symbol.attributes;

    return (
      <div className="gloss symbol-definition-gloss">
        <div className="gloss__section">
          {tex !== null ? <LatexPreview>{tex}</LatexPreview> : "<Symbol TeX>"}:{" "}
          {nicknames.length > 0 ? nicknames.join(", ") : "(no nicknames)."}
        </div>
        {/* {definitions.length > 0 ? (
          <div className="gloss__section">
            <b>Definition</b>:{" "}
            {definitions.map((d, i) => (
              <div key={`definition-${i}`}>
                <RichText>{d}</RichText>
              </div>
            ))}
          </div>
        ) : null}
        {defining_formulas.length > 0 ? (
          <div className="gloss__section">
            <b>Defining formulas</b>:{" "}
            {defining_formulas.map((f, i) => (
              <div key={`formula-${i}`}>
                <RichText>{f}</RichText>
              </div>
            ))}
          </div>
        ) : null}
        {passages.length > 0 ? (
          <div className="gloss__section">
            <b>Related passages</b>:
            <ul>
              {passages.map((p, i) => (
                <li key={`passage-${i}`}>
                  <RichText>{p}</RichText>
                </li>
              ))}
            </ul>
          </div>
        ) : null} */}
      </div>
    );
  }
}

export default SymbolDefinitionGloss;
