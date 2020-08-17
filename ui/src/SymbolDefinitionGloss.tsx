import React from "react";
import LatexPreview from "./LatexPreview";
import RichText from "./RichText";
import { Symbol } from "./types/api";
import * as uiUtils from "./utils/ui";

interface Props {
  symbol: Symbol;
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
            uiUtils.sortByFrequency(nicknames).join("; ") + "."}
        </div>
      </div>
    );
  }
}

export default SymbolDefinitionGloss;
