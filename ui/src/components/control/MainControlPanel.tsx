import Card from "@mui/material/Card";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
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
class MainControlPanel extends React.PureComponent<Props> {
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

export default MainControlPanel;
