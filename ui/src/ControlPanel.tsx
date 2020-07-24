import Card from "@material-ui/core/Card";
import FormGroup from "@material-ui/core/FormGroup";
import classNames from "classnames";
import React from "react";

interface Props {
  className?: string;
}

class ControlPanel extends React.PureComponent<Props> {
  render() {
    return (
      <Card
        className={classNames("control-panel-toolbar", this.props.className)}
        raised={true}
      >
        <p className="control-panel-toolbar__header">Control Panel</p>
        <FormGroup>{this.props.children}</FormGroup>
      </Card>
    );
  }
}

export default ControlPanel;
