import ClickAwayListener from "@material-ui/core/ClickAwayListener";
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
const BLACK_LISTED_CLASS_NAMES = ["tooltip-body__action-button", "MuiButton-label"]
export class Drawer extends React.PureComponent {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  componentWillUnmount() {
    const { pdfViewer } = this.context;
    if (pdfViewer != null) {
      pdfViewer.container.classList.remove(PDF_VIEWER_DRAWER_OPEN_CLASS);
    }
  }

  /**
   * XXX(zkirby): This is an unfortunate byproduct of the clickaway listener
   * listening to *all* clicks outside of the drawer. Any developer wishing to 
   * add a button that opens the drawer will need to add the class name of that element
   * to the black listed class names list. 
   */
  clickAwayClose = (e: React.MouseEvent<Document, MouseEvent>) => {
    const elementTarget = e.target as Element;
    let shouldClose = true;
    BLACK_LISTED_CLASS_NAMES.forEach(cls => {
      if (elementTarget.classList.contains(cls)) {
        shouldClose = false;
      }
    })
    
    if (shouldClose) {
      this.closeDrawer();
    }
  }

  closeDrawer = () => {
    switch(this.drawerState()) {
      case 'show-symbols': {
        this.context.setSelectedSymbol(null);
        break;
      }
      case 'show-citations': {
        this.context.setSelectedCitation(null);
        break;
      }
    }
  }

  drawerState = () => {
    if (this.context.selectedSymbol != null) {
      return 'show-symbols';
    } else if (this.context.selectedCitation != null) {
      return 'show-citations';
    }
    return 'closed';
  }

  render() {
    /**
     * The PDF viewer should know if the drawer is open so it can reposition the paper. Currently, we
     * notify the PDF viewer by adding a class, as the PDF viewer has no knowledge of the state
     * of this React application.
     */
    const { pdfViewer } = this.context;
    const drawerState = this.drawerState();
    if (pdfViewer != null) {
      if (drawerState !== "closed") {
        pdfViewer.container.classList.add(PDF_VIEWER_DRAWER_OPEN_CLASS);
      } else {
        pdfViewer.container.classList.remove(PDF_VIEWER_DRAWER_OPEN_CLASS);
      }
    }

    return (
      <ScholarReaderContext.Consumer>
        {({ selectedSymbol, selectedCitation }) => {
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
            <ClickAwayListener onClickAway={this.clickAwayClose}>
              <MuiDrawer
                className="drawer"
                variant="persistent"
                anchor="right"
                open={drawerState !== "closed"}
              >
                <div className="drawer__header">
                  <div className="drawer__close_icon">
                    <IconButton className="MuiButton-contained" onClick={this.closeDrawer}>
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
            </ClickAwayListener>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default Drawer;
