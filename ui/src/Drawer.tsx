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
const BLACK_LISTED_CLASS_NAME = "MuiTooltip-tooltip";
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
   * XXX(zkirby): Since the clickaway listener listens to *all* clicks outside of the 
   * drawer, if we do not have the code below it will close after a button is clicked that 
   * is meant to open the drawer. The code below simple gets the element that the click that is intending 
   * to close the drawer originated from and traverses the class list and class list of all 
   * parent elements looking for if this click happened from within a tooltip. 
   * Only close the drawer if the click is not within the tooltip.
   */
  clickAwayClose = (e: React.MouseEvent<Document, MouseEvent>) => {
    let elementTarget = e.target as (Element | null);
    while (elementTarget != null) {
      if (elementTarget.classList.contains(BLACK_LISTED_CLASS_NAME)) {
        return;
      }
      elementTarget = elementTarget.parentElement;
    }

    this.closeDrawer();
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
