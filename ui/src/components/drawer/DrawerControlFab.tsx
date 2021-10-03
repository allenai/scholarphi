import Fab from "@material-ui/core/Fab";
import { MenuOpen } from "@material-ui/icons";
import Close from "@material-ui/icons/Close";
import React from "react";

interface Props {
  drawerMode: string;
  handleOpenDrawer: () => void;
  handleCloseDrawer: () => void;
}

export class DrawerControlFab extends React.PureComponent<Props> {
  render() {
    const { drawerMode } = this.props;

    return (
      <>
        <Fab
          id="drawer-control-fab"
          color="default"
          style={{
            right: drawerMode === "closed" ? "50px" : "365px",
          }}
          onClick={
            drawerMode === "closed"
              ? this.props.handleOpenDrawer
              : this.props.handleCloseDrawer
          }
        >
          {drawerMode === "closed" ? <MenuOpen /> : <Close />}
        </Fab>
      </>
    );
  }
}

export default DrawerControlFab;
