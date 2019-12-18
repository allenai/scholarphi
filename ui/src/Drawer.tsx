import MuiDrawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import React from "react";
import { Favorites } from "./Favorites";
import FeedbackButton from "./FeedbackButton";
import PaperList from "./PaperList";
import SearchResults from "./SearchResults";
import { ScholarReaderContext } from "./state";

const PDF_VIEWER_DRAWER_OPEN_CLASS = "drawer-open";

export class Drawer extends React.PureComponent {
  componentWillUnmount() {
    const { pdfViewer } = this.context;
    if (pdfViewer !== undefined && pdfViewer !== null) {
      pdfViewer.container.classList.remove(PDF_VIEWER_DRAWER_OPEN_CLASS);
    }
  }

  render() {
    /**
     * The PDF viewer should know if the drawer is open so it can reposition the paper. Currently, we
     * notify the PDF viewer by adding a class, as the PDF viewer has no knowledge of the state
     * of this React application.
     */
    const { pdfViewer, drawerState } = this.context;
    if (pdfViewer !== undefined && pdfViewer !== null) {
      if (drawerState !== "closed") {
        pdfViewer.container.classList.add(PDF_VIEWER_DRAWER_OPEN_CLASS);
      } else {
        pdfViewer.container.classList.remove(PDF_VIEWER_DRAWER_OPEN_CLASS);
      }
    }

    return (
      <ScholarReaderContext.Consumer>
        {({ drawerState, setDrawerState, selectedSymbol, selectedCitation }) => {
          let extraContext;
          switch (drawerState) {
            case "show-citations": {
              extraContext = Object.assign(
                { drawerState },
                selectedCitation ? { citationId: selectedCitation.id } : null
              );
              break;
            }
            case "show-symbols": {
              extraContext = Object.assign(
                { drawerState },
                selectedSymbol ? { symbolId: selectedSymbol.id } : null
              );
              break;
            }
          }

          return (
            <MuiDrawer
              className="drawer"
              variant="persistent"
              anchor="right"
              open={drawerState !== "closed"}
            >
              <div className="drawer__header">
                <div>
                  <IconButton onClick={() => setDrawerState("closed")}>
                    <ChevronRightIcon />
                  </IconButton>
                </div>
                <FeedbackButton extraContext={ extraContext } />
              </div>
              <div className="drawer__content">
                <Favorites />
                {drawerState === "show-symbols" && (
                  <SearchResults pageSize={4} />
                )}
                {drawerState === "show-citations" && <PaperList />}
              </div>
            </MuiDrawer>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default Drawer;
