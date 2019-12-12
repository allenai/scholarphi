import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";
import ListItem from "@material-ui/core/ListItem";
import React from "react";
import Citation from "./Citation";
import * as api from "./types/api";
import { ScholarReaderContext } from "./state";
import Grid from '@material-ui/core/Grid';
import FeedbackButton from "./FeedbackButton";

interface CitationTooltipBodyProps {
  paperIds: string[];
  citation: api.Citation;
}

export class CitationTooltipBody extends React.Component<
  CitationTooltipBodyProps
> {
  render() {
    return (
      <div className="tooltip-body citation-tooltip-body">
        <Box padding="8px 8px 0">
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs>
              <div className="tooltip-body__section tooltip-body__label citation-tooltip-body__header">
                <strong>
                  This citation was matched to {this.props.paperIds.length}
                  {this.props.paperIds.length > 1 ? " papers" : " paper"}:
                </strong>
              </div>
              </Grid>
              <Grid item>
                <FeedbackButton extraContext={{ citationId: this.props.citation.id }} />
              </Grid>
            </Grid>
        </Box>
        <div className="tooltip-body__section">
          <List aria-label="cited papers">
            <ScholarReaderContext.Consumer>
              {({ setDrawerState, setJumpPaperId, setSelectedCitation }) => {
                return this.props.paperIds.map(s2Id => (
                  <ListItem
                    disableGutters
                    key={s2Id}
                    button
                    onClick={() => {
                      setSelectedCitation(this.props.citation);
                      setDrawerState("show-citations");
                      setJumpPaperId(s2Id);
                    }}
                  >
                    <Box padding="0 8px">
                      <Citation key={s2Id} paperId={s2Id} />
                    </Box>
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
