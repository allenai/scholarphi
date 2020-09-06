import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import React from "react";
import { ConfigurableSetting } from "./settings";

interface Props {
  setting: ConfigurableSetting;
  value: boolean | string | null;
  handleChange: (setting: ConfigurableSetting, value: any) => void;
}

/**
 * A control for an application-wide setting.
 */
class Control extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onChangeFlag = this.onChangeFlag.bind(this);
    this.onChangeChoice = this.onChangeChoice.bind(this);
  }

  onChangeFlag(event: React.ChangeEvent<HTMLInputElement>) {
    this.props.handleChange(this.props.setting, event.target.checked);
  }

  onChangeChoice(event: React.ChangeEvent<{ value: unknown }>) {
    this.props.handleChange(this.props.setting, event.target.value as string);
  }

  render() {
    const { type, label, choices } = this.props.setting;

    if (type === "flag") {
      return (
        <FormControlLabel
          className="control-panel-toolbar__switch-label"
          control={
            <Switch
              checked={this.props.value as boolean}
              color="primary"
              onChange={this.onChangeFlag}
            />
          }
          label={label}
        />
      );
    } else if (type === "choice" && choices !== undefined) {
      return (
        <FormControl>
          <TextField
            className="control-panel-toolbar__select"
            value={this.props.value as string}
            onChange={this.onChangeChoice}
            variant="outlined"
            label={label}
            select
          >
            {choices.map((choice) => (
              <MenuItem key={choice} value={choice}>
                {choice}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
      );
    }
  }
}

export default Control;
