import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import React from "react";
import Citation from "./Citation";

interface CitationTooltipBodyProps {
  paperIds: string[];
}

export class CitationTooltipBody extends React.Component<
  CitationTooltipBodyProps
> {
  render() {
    return (
      <div className="tooltip-body citation-tooltip-body">
        <div className="tooltip-body__section tooltip-body__label citation-tooltip-body__header">
          This citation was matched to {this.props.paperIds.length}
          {this.props.paperIds.length > 1 ? " papers" : " paper"}:
        </div>
        <div className="tooltip-body__section">
          <List aria-label="cited papers">
            {this.props.paperIds.map((paperId, i) => (
              <ListItem disableGutters key={paperId} button onClick={() => {}}>
                <Citation key={paperId} paperId={paperId} />
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    );
  }
}

export default CitationTooltipBody;
