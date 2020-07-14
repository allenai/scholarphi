import React from "react";
import LatexPreview from "./LatexPreview";
import { Symbol } from "./types/api";

interface Props {
  symbol: Symbol;
}

export class SymbolPropertiesTooltipBody extends React.PureComponent<Props> {
  render() {
    const { symbol } = this.props;
    const { tex, name, definition, equation, passages } = symbol.attributes;

    return (
      <div className="tooltip-body symbol-properties-tooltip-body">
        <div className="tooltip-body__section">
          {tex !== null ? <LatexPreview latex={tex} /> : "<Symbol TeX>"}:{" "}
          {name !== null ? name : "<name>"}
        </div>
        <div className="tooltip-body__section">
          <b>Definition</b>:{" "}
          {definition !== null ? (
            <LatexPreview latex={definition} />
          ) : (
            "<Definition>"
          )}
        </div>
        <div className="tooltip-body__section">
          <b>Equation</b>:{" "}
          {equation !== null ? <LatexPreview latex={equation} /> : "<Equation>"}
        </div>
        <div className="tooltip-body__section">
          <b>Related passages</b>: {passages.length === 0 ? "(none yet)" : ""}
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

export default SymbolPropertiesTooltipBody;
