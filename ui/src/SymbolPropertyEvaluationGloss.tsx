import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import LatexPreview from "./LatexPreview";
import { Symbol } from "./types/api";
import VoteButton from "./VoteButton";

interface Props {
  id: string;
  symbol: Symbol;
}

/**
 * A gloss showing a table of all properties extracted for a symbol.
 */
class SymbolPropertyEvaluationGloss extends React.PureComponent<Props> {
  render() {
    const { symbol } = this.props;
    const {
      nicknames,
      definitions,
      defining_formulas,
      passages,
    } = symbol.attributes;

    const context = {
      glossId: this.props.id,
      renderTime: Date.now(),
    };

    return (
      <div className="gloss symbol-property-evaluation-gloss">
        <div className="gloss__section">
          <Table size="small">
            <TableBody>
              {nicknames.map((nickname, i) => (
                <TableRow key={`nickname-${i}`}>
                  <TableCell>{nickname}</TableCell>
                  <TableCell>
                    <VoteButton
                      context={{ ...context, type: "nickname", i, nickname }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {definitions.map((definition, i) => (
                <TableRow key={`definition-${i}`}>
                  <TableCell>
                    <LatexPreview latex={definition} />
                  </TableCell>
                  <TableCell>
                    <VoteButton
                      context={{
                        ...context,
                        type: "definition",
                        i,
                        definition,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {defining_formulas.map((formula, i) => (
                <TableRow key={`formula-${i}`}>
                  <TableCell>
                    <LatexPreview latex={formula} />
                  </TableCell>
                  <TableCell>
                    <VoteButton
                      context={{ ...context, type: "formula", i, formula }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {passages.map((passage, i) => (
                <TableRow key={`passage-${i}`}>
                  <TableCell>
                    <LatexPreview latex={passage} />
                  </TableCell>
                  <TableCell>
                    <VoteButton
                      context={{ ...context, type: "passage", i, passage }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
}

export default SymbolPropertyEvaluationGloss;
