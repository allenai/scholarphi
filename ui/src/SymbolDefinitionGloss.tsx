import React from "react";
import LatexPreview from "./LatexPreview";
import RichText from "./RichText";
import { Symbol } from "./types/api";

interface Props {
  symbol: Symbol;
}

class SymbolDefinitionGloss extends React.PureComponent<Props> {
  render() {
    const { symbol } = this.props;
    const { tex, nicknames, definitions } = symbol.attributes;
    const uniqueNicknames: string[] = [];
    nicknames.forEach((n) => {
      if (uniqueNicknames.indexOf(n) === -1) {
        uniqueNicknames.push(n);
      }
    });

    return (
      <div className="gloss symbol-definition-gloss">
        <div className="gloss__section">
          {tex !== null ? <LatexPreview>{tex}</LatexPreview> : "<Symbol TeX>"}:{" "}
          {definitions.length > 0 && (
            <RichText>{definitions[0] + "."}</RichText>
          )}
          {definitions.length === 0 &&
            uniqueNicknames.length > 0 &&
            uniqueNicknames.map((n, i) => (
              <React.Fragment key={`nickname-${i}`}>
                <RichText>{n}</RichText>
                {i < uniqueNicknames.length - 1 ? "; " : ". "}
              </React.Fragment>
            ))}
        </div>
      </div>
    );
  }
}

export default SymbolDefinitionGloss;
