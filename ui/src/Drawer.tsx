import MuiDrawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import React from "react";
import SearchResults from "./SearchResults";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";

const PDF_VIEWER_DRAWER_OPEN_CLASS = "drawer-open";

export class Drawer extends React.Component {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  componentWillUnmount() {
    const { pdfViewer } = this.context;
    if (pdfViewer !== null) {
      pdfViewer.container.classList.remove(PDF_VIEWER_DRAWER_OPEN_CLASS);
    }
  }

  render() {
    /**
     * The PDF viewer should know if the drawer is open so it can reposition the paper. Currently, we
     * notify the PDF viewer by adding a class, as the PDF viewer has no knowledge of the state
     * of this React application.
     */
    const { pdfViewer, openDrawer } = this.context;
    if (pdfViewer !== null) {
      if (openDrawer) {
        pdfViewer.container.classList.add(PDF_VIEWER_DRAWER_OPEN_CLASS);
      } else {
        pdfViewer.container.classList.remove(PDF_VIEWER_DRAWER_OPEN_CLASS);
      }
    }

    return (
      <ScholarReaderContext.Consumer>
        {({ openDrawer, setOpenDrawer, selectedSymbol, symbols, mathMl }) => {
          return (
            <MuiDrawer
              className="drawer"
              variant="persistent"
              anchor="right"
              open={openDrawer}
            >
              <div className="drawer__header">
                <IconButton onClick={() => setOpenDrawer(false)}>
                  <ChevronRightIcon />
                </IconButton>
              </div>
              <div>
                {selectedSymbol !== null && (
                  <SearchResults
                    results={selectors.matchingSymbols(
                      selectedSymbol,
                      [...symbols],
                      [...mathMl]
                    )}
                    pageSize={5}
                  />
                )}
              </div>
            </MuiDrawer>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default Drawer;
