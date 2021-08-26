import { getRemoteLogger } from "../../logging";
import * as uiUtils from "../../utils/ui";
import { PDFViewer } from "../../types/pdfjs-viewer";
import { Entities } from "../../state";
import { Entity, isPaperQuestion } from "../../api/types";
import FAQ from "../questions/FAQ";
import IconButton from "@material-ui/core/IconButton";
import React from "react";
import MuiDrawer from "@material-ui/core/Drawer";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { makeStyles, useTheme } from '@material-ui/core/styles';

const logger = getRemoteLogger();


export type DrawerMode = "open" | "closed";
export type DrawerContentType =
  | "definitions"
  | "defining-formulas"
  | "usages"
  | "entity-property-editor"
  | null;

interface Props {
  pdfViewer: PDFViewer;
  mode: DrawerMode;
  contentType: DrawerContentType;
  entities: Entities;
  selectedEntityIds: string[];
  propagateEntityEdits: boolean;
  selectedFAQID : string | null;
  FAQHoveredID : string | null;
  handleClose: () => void;
  handleMouseOver: (entityId: string)=> void;
  handleMouseOut: (entityId: string)=> void;
  handleClick: (entityId: string)=> void;
  handleJumpToEntity: (entityId: string) => void;
  handleSetPropagateEntityEdits: (propagate: boolean) => void;

}

class FAQBar extends React.PureComponent<Props> {


    constructor(props: Props) {
        super(props);
        this.onScroll = this.onScroll.bind(this);
        this.closeDrawer = this.closeDrawer.bind(this);
      }

      componentWillUnmount() {
        const { pdfViewer } = this.props;
        if (pdfViewer != null) {
          this.removePdfPositioningForDrawerOpen(pdfViewer.container);
        }
      }

      onScroll(event: React.UIEvent<HTMLDivElement>) {
        if (event.target instanceof HTMLDivElement) {
          logger.log(
            "debug",
            "scroll-drawer",
            {
              scroll: uiUtils.getScrollCoordinates(event.target),
            },
            500
          );
        }
      }

      positionPdfForDrawerOpen(
        pdfViewerContainer: HTMLElement,
        drawerContentType: string
      ) {
        pdfViewerContainer.classList.add(`drawer-${drawerContentType}`);
      }

      removePdfPositioningForDrawerOpen(pdfViewerContainer: HTMLElement) {
        pdfViewerContainer.classList.forEach((c) => {
          if (c.indexOf("drawer-") !== -1) {
            pdfViewerContainer.classList.remove(c);
          }
        });
      }

      closeDrawer() {
        if (this.props.mode !== "closed") {
          this.props.handleClose();
        }
      }

      getFAQs() {
        return this.props.entities? this.props.entities.all.map((entityId) => {
            /*
             * Unpack entity data.
             */
            const entity = this.props.entities.byId[entityId];
            const isSelected = this.props.selectedFAQID? entityId === this.props.selectedFAQID : false;
            const isHovered = this.props.FAQHoveredID? entityId === this.props.FAQHoveredID : false;

            if (isPaperQuestion(entity)) {
              return (
                <FAQ
                  key={entity.id}
                  question={entity}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  entities={this.props.entities}
                  handleJumpToEntity={this.props.handleJumpToEntity}
                  handleMouseOver={this.props.handleMouseOver}
                  handleMouseOut={this.props.handleMouseOut}
                  handleClick={this.props.handleClick}
                />
              );
            }
        }) : null;
    }


  render() {
    /**
     * The PDF viewer should know if the drawer is open so it can reposition the paper. Currently, we
     * notify the PDF viewer by adding a class, as the PDF viewer otherwise has no knowledge of the
     * state of this React application.
     */
     const {
        pdfViewer,
        mode,
        contentType,
      } = this.props;


      if (pdfViewer != null) {
        if (mode === "open" && contentType !== null) {
          this.removePdfPositioningForDrawerOpen(pdfViewer.container);
          this.positionPdfForDrawerOpen(pdfViewer.container, contentType);
        } else {
          this.removePdfPositioningForDrawerOpen(pdfViewer.container);
        }
      }

      const FAQs = this.getFAQs();

      return (
        <MuiDrawer
          className="drawer"
          variant="persistent"
          anchor="right"
          /*
           * If for the drawer has been requested to open but there's nothing to show
           * in it, don't show it.
           */
          open={mode === "open"}
          onScroll={this.onScroll}
        >
          <div className="drawer__header">
              <div className="drawer__close_icon">
                <IconButton size="small" onClick={this.closeDrawer}>
                  <ChevronRightIcon />
                </IconButton>
              </div>
              {' '}
              <p className="drawer__header__content">FAQs</p>
              <p> Hover or click on a question to highlight it's answer in the document!</p>
          </div>
          <div className="drawer__content">
            {FAQs}
           </div>
        </MuiDrawer>
      );
  }
}

export default FAQBar;
