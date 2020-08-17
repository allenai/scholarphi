import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import React from "react";
import PropertyTableSection from "./PropertyTableSection";
import { Term } from "./types/api";

interface Props {
  id: string;
  term: Term;
}

export class TermPropertyEvaluationGloss extends React.PureComponent<Props> {
  render() {
    const { term } = this.props;
    const { term_type, definition_texs } = term.attributes;

    const context = {
      glossId: this.props.id,
      renderTime: Date.now(),
    };

    return (
      <div className="gloss property-evaluation-gloss term-property-evaluation-gloss">
        <div className="gloss__section gloss__header">
          <b>{term.attributes.name}</b>
        </div>
        <div className="gloss__section">
          <Table size="small">
            <TableBody>
              <PropertyTableSection
                header={
                  term_type === "Abbreviation" ? "Expansion" : "Definitions"
                }
                context={context}
                data={definition_texs}
              />
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
}

export default TermPropertyEvaluationGloss;
