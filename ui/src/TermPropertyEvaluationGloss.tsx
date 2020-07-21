import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import LatexPreview from "./LatexPreview";
import { Term } from "./types/api";
import VoteButton from "./VoteButton";

interface Props {
  id: string;
  term: Term;
}

export class TermPropertyEvaluationGloss extends React.PureComponent<Props> {
  render() {
    const { term } = this.props;
    const { definitions, passages } = term.attributes;

    const context = {
      glossId: this.props.id,
      renderTime: Date.now(),
    };

    return (
      <div className="gloss term-property-evaluation-gloss">
        <div className="gloss__section">
          <Table size="small">
            <TableBody>
              {definitions.map((definition, i) => (
                <TableRow key={`definition-${i}`}>
                  <TableCell>
                    <LatexPreview latex={definition} />
                  </TableCell>
                  <TableCell>
                    <VoteButton
                      context={{ ...context, type: "definition", i }}
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
                    <VoteButton context={{ ...context, type: "passage", i }} />
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

export default TermPropertyEvaluationGloss;
