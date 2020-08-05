import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import { getRemoteLogger } from "./logging";
import RichText from "./RichText";
import VoteButton from "./VoteButton";

const logger = getRemoteLogger();

interface Props {
  header: string;
  data: string[];
  context: any;
}

interface State {
  visibleRows: number;
}

class PropertyTableSection extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      visibleRows: 2,
    };
    this.onClickShowMore = this.onClickShowMore.bind(this);
  }

  onClickShowMore() {
    logger.log("debug", "Clicked on show more", {
      ...this.props.context,
      currentVisibleRows: this.state.visibleRows,
    });
    this.setState((prevState) => ({
      visibleRows: prevState.visibleRows + 2,
    }));
  }

  render() {
    return (
      <>
        <TableRow className="property-evaluation-gloss__header">
          <TableCell>{this.props.header}</TableCell>
          <TableCell className="vote-button"></TableCell>
        </TableRow>
        {this.props.data.length === 0 ? (
          <TableRow>
            <TableCell className="property-evaluation-gloss__not-defined">
              Not explicitly defined in this paper.
            </TableCell>
            <TableCell className="vote-button">
              <VoteButton
                context={{ ...this.props.context, tag: "not-defined-message" }}
              />
            </TableCell>
          </TableRow>
        ) : (
          <>
            {this.props.data.slice(0, this.state.visibleRows).map((d, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div
                    ref={(ref) => {
                      logger.log("debug", "render-property", {
                        ...this.props.context,
                        row: i,
                        data: d,
                      });
                    }}
                    className="property-evaluation-gloss__property"
                  >
                    <RichText>{d}</RichText>
                  </div>
                </TableCell>
                <TableCell className="vote-button">
                  <VoteButton
                    context={{ ...this.props.context, row: i, data: d }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {this.state.visibleRows < this.props.data.length ? (
              <TableRow>
                <TableCell>
                  <span
                    className="property-evaluation-gloss__clickable-link"
                    onClick={this.onClickShowMore}
                  >
                    Show more
                  </span>
                </TableCell>
                <TableCell />
              </TableRow>
            ) : null}
          </>
        )}
      </>
    );
  }
}

export default PropertyTableSection;
