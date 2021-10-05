import Fab from "@material-ui/core/Fab";
import { MenuOpen } from "@material-ui/icons";
import Close from "@material-ui/icons/Close";
import React from "react";
import { getRemoteLogger } from "../../logging";

const logger = getRemoteLogger();

interface Props {
  drawerOpen: boolean;
  handleOpenDrawer: () => void;
  handleCloseDrawer: () => void;
}

export class DrawerControlFab extends React.PureComponent<Props> {
  handleFabClicked = () => {
    const { drawerOpen } = this.props;
    if (drawerOpen) {
      logger.log("debug", "click-close-drawer-tooltip-button");
      this.props.handleCloseDrawer();
    } else {
      logger.log("debug", "click-open-drawer-tooltip-button");
      this.props.handleOpenDrawer();
    }
  };

  render() {
    const { drawerOpen } = this.props;

    return (
      <>
        <Fab
          id="drawer-control-fab"
          color="default"
          style={{
            right: drawerOpen ? "365px" : "50px",
          }}
          onClick={
            drawerOpen
              ? this.props.handleCloseDrawer
              : this.props.handleOpenDrawer
          }
        >
          {drawerOpen ? <Close /> : <MenuOpen />}
        </Fab>
      </>
    );
  }
}

export default DrawerControlFab;
