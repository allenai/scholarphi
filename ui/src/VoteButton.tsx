import Checkbox from "@material-ui/core/Checkbox";
import React from "react";

interface Props {
  /**
   * Context to be saved when the check box is clicked. Should include enough information
   * to uniquely identify this check box in the log data.
   */
  context: any;
}

class VoteButton extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { creationTime: Date.now() };
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(
      "Checked?",
      event.target.checked,
      "Context",
      JSON.stringify(this.props.context)
    );
  }

  render() {
    return <Checkbox onChange={this.onChange} />;
  }
}

export default VoteButton;
