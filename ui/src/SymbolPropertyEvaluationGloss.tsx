import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import LatexPreview from "./LatexPreview";
import { Symbol } from "./types/api";
import VoteButton from "./VoteButton";

interface RowProps {
  id: string;
  content: string;
  symbol: Symbol;
  isDescendant: boolean;
  glossId: string;
}

class Row extends React.PureComponent<RowProps> {
  render() {
    const { symbol } = this.props;
    const context = {
      glossId: this.props.glossId,
      symbolId: symbol.id,
      symbolTex: symbol.attributes.tex,
      symbolMathMl: symbol.attributes.mathml,
      isDescendant: this.props.isDescendant,
    };

    return (
      <TableRow>
        <TableCell>
          <LatexPreview latex={symbol.attributes.tex || "?"} />
        </TableCell>
        <TableCell>
          <LatexPreview latex={this.props.content} />
        </TableCell>
        <TableCell>
          <VoteButton context={context} />
        </TableCell>
      </TableRow>
    );
  }
}

interface Props {
  id: string;
  symbol: Symbol;
  descendants: Symbol[];
}

/**
 * A gloss showing a table of all properties extracted for a symbol.
 */
class SymbolPropertyEvaluationGloss extends React.PureComponent<Props> {
  render() {
    const symbols = [this.props.symbol, ...this.props.descendants];

    return (
      <div className="gloss symbol-property-evaluation-gloss">
        <div className="gloss__section">
          <Table size="small">
            <TableBody>
              {symbols.map((s, symbolIndex) => {
                const {
                  nicknames,
                  definitions,
                  defining_formulas,
                  passages,
                } = s.attributes;
                return (
                  <React.Fragment key={s.id}>
                    {nicknames.map((nickname, i) => (
                      <Row
                        key={`symbol-${s.id}-nickname-${i}`}
                        id={`symbol-${s.id}-nickname-${i}`}
                        content={nickname}
                        glossId={this.props.id}
                        isDescendant={symbolIndex === 0}
                        symbol={s}
                      />
                    ))}
                    {definitions.map((definition, i) => (
                      <Row
                        key={`symbol-${s.id}-definition-${i}`}
                        id={`symbol-${s.id}-definition-${i}`}
                        content={definition}
                        glossId={this.props.id}
                        isDescendant={symbolIndex === 0}
                        symbol={s}
                      />
                    ))}
                    {defining_formulas.map((formula, i) => (
                      <Row
                        key={`symbol-${s.id}-formula-${i}`}
                        id={`symbol-${s.id}-formula-${i}`}
                        content={formula}
                        glossId={this.props.id}
                        isDescendant={symbolIndex === 0}
                        symbol={s}
                      />
                    ))}
                    {passages.map((passage, i) => (
                      <Row
                        key={`symbol-${s.id}-passage-${i}`}
                        id={`symbol-${s.id}-passage-${i}`}
                        content={passage}
                        glossId={this.props.id}
                        isDescendant={symbolIndex === 0}
                        symbol={s}
                      />
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
}

export default SymbolPropertyEvaluationGloss;
