import React from "react";
import LatexPreview from "./LatexPreview";
import RichText from "./RichText";
import { Symbol } from "./types/api";

interface Props {
  symbol: Symbol;
}

function sortByFrequency(strings: string[]) {
  /*
   * Count up frequency of each item.
   */
  const counts = strings.reduce((c, s) => {
    c[s] = (c[s] || 0) + 1;
    return c;
  }, {} as { [s: string]: number });

  /*
   * Sort items by their frequency.
   */
  const countsKeys = Object.keys(counts);
  const indexes = countsKeys.map((_, i) => i);
  indexes.sort((i1, i2) => {
    const s1 = countsKeys[i1];
    const s2 = countsKeys[i2];
    return counts[s1] - counts[s2];
  });

  return indexes.map((i) => countsKeys[i]);
}

class SymbolDefinitionGloss extends React.PureComponent<Props> {
  render() {
    const { symbol } = this.props;
    const { tex, nicknames, definitions } = symbol.attributes;

    return (
      <div className="gloss symbol-definition-gloss">
        <div className="gloss__section">
          {tex !== null ? <LatexPreview>{tex}</LatexPreview> : "<Symbol TeX>"}:{" "}
          {definitions.length > 0 && (
            <RichText>{definitions[0] + "."}</RichText>
          )}
          {definitions.length === 0 &&
            nicknames.length > 0 &&
            sortByFrequency(nicknames).join("; ") + "."}
        </div>
      </div>
    );
  }
}

export default SymbolDefinitionGloss;
