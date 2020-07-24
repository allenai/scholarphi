import Checkbox from "@material-ui/core/Checkbox";
import React from "react";
import { getRemoteLogger } from "./logging";

interface Props {
  /**
   * Context to be saved when the check box is clicked. Should include enough information
   * to uniquely identify this check box in the log data.
   */
  context: any;
}

const logger = getRemoteLogger();

class VoteButton extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { creationTime: Date.now() };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    logger.log("debug", "property-vote-rendered", {
      ...this.props.context,
    });
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    logger.log("debug", "property-vote-changed", {
      ...this.props.context,
      checked: event.target.checked,
    });
  }

  render() {
    return <Checkbox onChange={this.onChange} />;
  }
}

export default VoteButton;
