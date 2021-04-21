import * as React from "react";
import { Paper } from "../../../api/types";
import { truncateText } from "../../../utils/ui";

interface Props {
  paper: Paper;
}

interface State {
  showFullAbstract: boolean;
}

export default class PaperAbstract extends React.Component<Props, State> {
  state = {
    showFullAbstract: false,
  };

  toggleFullAbstract = () => {
    this.setState((prev) => {
      return {
        showFullAbstract: !prev.showFullAbstract,
      };
    });
  };

  render() {
    const { paper } = this.props;
    const { showFullAbstract } = this.state;
    const truncatedAbstract = paper.abstract
      ? truncateText(paper.abstract, 300)
      : null;
    const abstractsMatch = truncatedAbstract === paper.abstract;
    const expandMsg = showFullAbstract ? "(show less)" : "(show more)";
    return (
      <p className="paper-summary__abstract">
        {showFullAbstract || abstractsMatch
          ? paper.abstract
          : truncatedAbstract}
        {!abstractsMatch && (
          <span
            className="paper-summary__abstract__show-more-label"
            onClick={this.toggleFullAbstract}
          >
            {expandMsg}
          </span>
        )}
      </p>
    );
  }
}
