import { MenuOpen } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import Fab from "@mui/material/Fab";
import classNames from "classnames";
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
          className={classNames({ "drawer-open": drawerOpen })}
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
