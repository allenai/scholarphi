import { getRemoteLogger } from "../../logging";

import IconButton from "@material-ui/core/IconButton";
import ThumbsUp from "@material-ui/icons/ThumbUpSharp";
import React from "react";

interface Props {
  /**
   * Context to be saved when the check box is clicked. Should include enough information
   * to uniquely identify this check box in the log data.
   */
  context: any;
}

interface State {
  checked: boolean;
}

const logger = getRemoteLogger();

export class VoteButton extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { checked: false };
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    logger.log("debug", "vote-button-rendered", {
      ...this.props.context,
    });
  }

  onClick() {
    this.setState((prevState) => {
      const checked = !prevState.checked;
      logger.log("debug", "vote-button-changed", {
        ...this.props.context,
        checked,
      });
      return { checked };
    });
  }

  render() {
    return (
      <IconButton size="small" onClick={this.onClick}>
        <ThumbsUp color={this.state.checked ? "primary" : undefined} />
      </IconButton>
    );
  }
}
