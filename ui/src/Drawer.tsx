import MuiDrawer from "@material-ui/core/Drawer";
import React from "react";
import { ScholarReaderContext } from "./state";

export class Drawer extends React.Component {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ openDrawer: showDrawer }) => {
          return (
            <MuiDrawer
              className="drawer"
              variant="persistent"
              anchor="right"
              open={showDrawer}
            >
              <div>
                <p>Hello world!</p>
              </div>
            </MuiDrawer>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default Drawer;
