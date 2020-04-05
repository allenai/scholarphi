import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MuiDrawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import React from "react";
import FeedbackButton from "./FeedbackButton";
import PaperList from "./PaperList";
import SearchResults from "./SearchResults";
import { ScholarReaderContext } from "./state";

const PDF_VIEWER_DRAWER_OPEN_CLASS = "drawer-open";
const BLACK_LISTED_CLASS_NAME = "MuiTooltip-tooltip";

export class Drawer extends React.PureComponent {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  positionPdfForDrawerOpen(pdfViewerContainer: HTMLElement) {
    // Creating padding for scroll
    Array.from(pdfViewerContainer.children).forEach(page => {
      // XXX(zkirby, andrewhead) per our discussion at https://github.com/allenai/scholar-reader/pull/38/files#r388514946
      // this is 'safe' as pages are not deleted when scrolled out of view (just their inner content).
      page.classList.add(PDF_VIEWER_DRAWER_OPEN_CLASS);
    });

    const { drawerState, selectedEntityType } = this.context;
    if (drawerState === "open" && selectedEntityType === "symbol") {
      this.context.scrollSymbolIntoView();
    }
  }

  removePdfPositioningForDrawerOpen(pdfViewerContainer: HTMLElement) {
    Array.from(pdfViewerContainer.children).forEach(page => {
      page.classList.remove(PDF_VIEWER_DRAWER_OPEN_CLASS);
    });
  }

  componentWillUnmount() {
    const { pdfViewer } = this.context;
    if (pdfViewer != null) {
      this.removePdfPositioningForDrawerOpen(pdfViewer.viewer);
    }
  }

  /**
   * XXX(zkirby): Since the clickaway listener listens to *all* clicks outside of the
   * drawer, if we do not have the code below it will close after a button is clicked that
   * is meant to open the drawer. The code below simply gets the element that the click that is intending
   * to close the drawer originated from and traverses the class list and class list of all
   * parent elements looking for if this click happened from within a tooltip.
   * Only close the drawer if the click is not within the tooltip.
   */
  closeOnClickAway = (e: React.MouseEvent<Document, MouseEvent>) => {
    let elementTarget = e.target as Element | null;
    while (elementTarget != null) {
      if (elementTarget.classList.contains(BLACK_LISTED_CLASS_NAME)) {
        return;
      }
      elementTarget = elementTarget.parentElement;
    }

    this.closeDrawer();
  };

  closeDrawer() {
    if (this.context.drawerState !== "closed") {
      this.context.setDrawerState("closed");
      this.context.setSelectedEntity(null, null);
    }
  }

  render() {
    /**
     * The PDF viewer should know if the drawer is open so it can reposition the paper. Currently, we
     * notify the PDF viewer by adding a class, as the PDF viewer otherwise has no knowledge of the
     * state of this React application.
     */
    const { pdfViewer, drawerState } = this.context;
    if (pdfViewer != null) {
      if (drawerState === "open") {
        this.positionPdfForDrawerOpen(pdfViewer.viewer);
      } else {
        this.removePdfPositioningForDrawerOpen(pdfViewer.viewer);
      }
    }

    return (
      <ScholarReaderContext.Consumer>
        {({ selectedEntityType, selectedEntityId }) => {
          const extraContext = {
            drawerState,
            selectedEntityType,
            selectedEntityId
          };
          return (
            <ClickAwayListener onClickAway={this.closeOnClickAway}>
              <MuiDrawer
                className="drawer"
                variant="persistent"
                anchor="right"
                open={drawerState !== "closed"}
              >
                <div className="drawer__header">
                  <div className="drawer__close_icon">
                    <IconButton
                      className="MuiButton-contained"
                      onClick={this.closeDrawer.bind(this)}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </div>
                  <FeedbackButton extraContext={extraContext} />
                </div>
                <div className="drawer__content">
                  {drawerState === "open" &&
                    selectedEntityType === "symbol" && (
                      <SearchResults pageSize={4} />
                    )}
                  {drawerState === "open" &&
                    selectedEntityType === "citation" && <PaperList />}
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
