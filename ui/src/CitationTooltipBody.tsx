import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import React from "react";
import Citation from "./Citation";
import { ScholarReaderContext } from "./state";

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
            <ScholarReaderContext.Consumer>
              {({ setDrawerState, setJumpPaperId }) => {
                return this.props.paperIds.map(s2Id => (
                  <ListItem
                    disableGutters
                    key={s2Id}
                    button
                    onClick={() => {
                      setDrawerState("show-citations");
                      setJumpPaperId(s2Id);
                    }}
                  >
                    <Citation key={s2Id} paperId={s2Id} />
                  </ListItem>
                ));
              }}
            </ScholarReaderContext.Consumer>
          </List>
        </div>
      </div>
    );
  }
}

export default CitationTooltipBody;
