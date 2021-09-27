import IconButton from "@material-ui/core/IconButton";
import MuiTooltip from "@material-ui/core/Tooltip";
import Close from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import Toc from "@material-ui/icons/Toc";
import { default as React } from "react";

interface Props {
  x: number;
  y: number;
  handleClose: () => void;
  handleDeleteHighlight: () => void;
  handleOpenDrawer: () => void;
}

class DiscourseControlToolbar extends React.PureComponent<Props> {
  render() {
    const { x, y } = this.props;

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
                    <Toc />
                  </IconButton>
                </MuiTooltip>
              </td>
              <td>
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
              </td>
              <td>
                <MuiTooltip title="Close tooltip">
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
