import React from "react";
import LatexPreview from "./LatexPreview";
import { Symbol } from "./types/api";

interface Props {
  symbol: Symbol;
}

export class SymbolGloss extends React.PureComponent<Props> {
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
      <div className="gloss symbol-properties-gloss">
        <div className="gloss__section">
          {tex !== null ? <LatexPreview latex={tex} /> : "<Symbol TeX>"}:{" "}
          {nicknames.length > 0 ? nicknames.join(", ") : "(no nicknames)."}
        </div>
        <div className="gloss__section">
          <b>Definition</b>:{" "}
          {definitions.length > 0
            ? definitions.map((d) => <LatexPreview latex={d} />).join(", ")
            : "(none)."}
        </div>
        <div className="gloss__section">
          <b>Defining formulas</b>:{" "}
          {defining_formulas.length > 0
            ? defining_formulas.map((f) => (
                <div>
                  <LatexPreview latex={f} />
                </div>
              ))
            : "(none)."}
        </div>
        <div className="gloss__section">
          <b>Related passages</b>: {passages.length === 0 ? "(none)." : ""}
          <ul>
            {passages.map((p) => (
              <li>
                <LatexPreview latex={p} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default SymbolGloss;
