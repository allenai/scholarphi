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
          {tex !== null ? <LatexPreview latex={tex} /> : "<Symbol TeX>"}:{" "}
          {nicknames.length > 0 ? nicknames.join(", ") : "(no nicknames)."}
        </div>
        {definitions.length > 0 ? (
          <div className="gloss__section">
            <b>Definition</b>:{" "}
            {definitions.map((d) => (
              <div>
                <LatexPreview latex={d} />
              </div>
            ))}
          </div>
        ) : null}
        {defining_formulas.length > 0 ? (
          <div className="gloss__section">
            <b>Defining formulas</b>:{" "}
            {defining_formulas.map((f) => (
              <div>
                <LatexPreview latex={f} />
              </div>
            ))}
          </div>
        ) : null}
        {passages.length > 0 ? (
          <div className="gloss__section">
            <b>Related passages</b>:
            <ul>
              {passages.map((p) => (
                <li>
                  <LatexPreview latex={p} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }
}

export default SymbolDefinitionGloss;
