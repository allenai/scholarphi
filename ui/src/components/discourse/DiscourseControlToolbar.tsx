import IconButton from "@material-ui/core/IconButton";
import MuiTooltip from "@material-ui/core/Tooltip";
import Close from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterIcon from "@material-ui/icons/Filter";
import MenuOpenIcon from "@material-ui/icons/MenuOpen";
import { default as React } from "react";

interface Props {
  x: number;
  y: number;
  label: string;
  handleClose: () => void;
  handleDeleteHighlight: () => void;
  handleOpenDrawer: () => void;
  handleFilterToDiscourse: () => void;
}

class DiscourseControlToolbar extends React.PureComponent<Props> {
  render() {
    const { x, y, label } = this.props;

    return (
      <div
        className="discourse-control-toolbar side-right"
        style={{
          top: y,
          left: x,
          transform: "translate(-50%, 0)",
        }}
      >
        <table>
          <tbody>
            <tr>
              <td>
                <MuiTooltip title="Open drawer">
                  <IconButton
                    size="small"
                    onClick={this.props.handleOpenDrawer}
                  >
                    <MenuOpenIcon />
                  </IconButton>
                </MuiTooltip>
              </td>
              <td>
                <MuiTooltip title={`Show ${label} highlights only`}>
                  <IconButton
                    size="small"
                    onClick={this.props.handleFilterToDiscourse}
                  >
                    <FilterIcon />
                  </IconButton>
                </MuiTooltip>
              </td>
              {/* <td>
                <MuiTooltip title="Delete highlight">
                  <IconButton
                    size="small"
                    onClick={() => {
                      this.props.handleDeleteHighlight();
                      this.props.handleClose();
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </MuiTooltip>
              </td> */}
              <td>
                <MuiTooltip title="Close">
                  <IconButton size="small" onClick={this.props.handleClose}>
                    <Close />
                  </IconButton>
                </MuiTooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default DiscourseControlToolbar;
