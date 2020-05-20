import React from "react";
import * as api from "./types/api";

interface TermTooltipBodyProps {
  term: api.Term;
}

export class TermTooltipBody extends React.PureComponent<
  TermTooltipBodyProps
> {
  render() {
    return (
      <div className="tooltip-body citation-tooltip-body">
        <div className="tooltip-body__section">
          <div className="tooltip-body__citation">
            <p>This is a sample definition. {this.props.term.name} {this.props.term.definition}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default TermTooltipBody;
