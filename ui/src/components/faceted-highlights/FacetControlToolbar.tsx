import IconButton from "@mui/material/IconButton";
import MuiTooltip from "@mui/material/Tooltip";
import Close from "@mui/icons-material/Close";
import FilterIcon from "@mui/icons-material/Filter";
import ListIcon from "@mui/icons-material/List";
import { default as React } from "react";
import { getRemoteLogger } from "../../logging";

const logger = getRemoteLogger();

interface Props {
  x: number;
  y: number;
  label: string;
  drawerOpen: boolean;
  handleClose: () => void;
  handleDeleteHighlight: () => void;
  handleOpenDrawer: () => void;
  handleCloseDrawer: () => void;
  handleFilterToFacet: () => void;
}

class FacetControlToolbar extends React.PureComponent<Props> {
  handleDrawerButtonClicked = () => {
    const { drawerOpen } = this.props;
    if (drawerOpen) {
      logger.log("debug", "click-close-drawer-tooltip-button");
      this.props.handleCloseDrawer();
    } else {
      logger.log("debug", "click-open-drawer-tooltip-button");
      this.props.handleOpenDrawer();
    }
  };

  handleFilterToFacet = () => {
    logger.log("debug", "click-filter-to-facet-tooltip-button", {
      facet: this.props.label,
    });
    this.props.handleFilterToFacet();
  };

  handleClose = () => {
    logger.log("debug", "click-close-tooltip-button");
    this.props.handleClose();
  };

  render() {
    const { x, y, label, drawerOpen } = this.props;

    return (
      <div
        className="facet-control-toolbar side-right"
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
                <MuiTooltip title={drawerOpen ? "Close drawer" : "Open drawer"}>
                  <IconButton
                    size="small"
                    onClick={this.handleDrawerButtonClicked}
                  >
                    <ListIcon />
                  </IconButton>
                </MuiTooltip>
              </td>
              <td>
                <MuiTooltip title={`Show ${label} highlights only`}>
                  <IconButton size="small" onClick={this.handleFilterToFacet}>
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
                  <IconButton size="small" onClick={this.handleClose}>
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

export default FacetControlToolbar;
