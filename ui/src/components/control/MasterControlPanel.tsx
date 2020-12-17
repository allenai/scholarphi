import Card from "@material-ui/core/Card";
import FormGroup from "@material-ui/core/FormGroup";
import IconButton from "@material-ui/core/IconButton";
import Close from "@material-ui/icons/Close";
import classNames from "classnames";
import React from "react";

interface Props {
  className?: string;
  handleClose: () => void;
}

/**
 * Control panel for turning turn on or off features of the user interface. Meant for use by
 * developers, or by participants in usability studies.
 */
class MasterControlPanel extends React.PureComponent<Props> {
  render() {
    return (
      <Card
        className={classNames(
          "control-panel-toolbar vertical",
          this.props.className
        )}
        raised={true}
      >
        <div className="control-panel-toolbar__header">
          <div className="control-panel-toolbar__header__title">
            Control Panel
          </div>
          <div className="control-panel-toolbar__header__close-button">
            <IconButton size="small" onClick={this.props.handleClose}>
              <Close />
            </IconButton>
          </div>
        </div>

        <FormGroup>{this.props.children}</FormGroup>
      </Card>
    );
  }
}

export default MasterControlPanel;
