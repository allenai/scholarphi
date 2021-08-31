import React from "react";
import ReactDOM from "react-dom";
import { isPaperQuestion } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import { Entities } from "../../state";
import { PDFViewer } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import FAQ from "../questions/FAQ";

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
  selectedFAQID: string | null;
  FAQHoveredID: string | null;
  handleClose: () => void;
  handleMouseEnter: (entityId: string) => void;
  handleMouseLeave: (entityId: string) => void;
  handleClick: (entityId: string) => void;
  handleJumpToEntity: (entityId: string) => void;
  handleSetPropagateEntityEdits: (propagate: boolean) => void;
}

class FAQBar extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    // this.onScroll = this.onScroll.bind(this);
    // this.closeDrawer = this.closeDrawer.bind(this);
  }

  componentWillUnmount() {
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
    return this.props.entities
      ? this.props.entities.all.map((entityId) => {
          /*
           * Unpack entity data.
           */
          const entity = this.props.entities.byId[entityId];
          const isSelected = this.props.selectedFAQID
            ? entityId === this.props.selectedFAQID
            : false;
          const isHovered = this.props.FAQHoveredID
            ? entityId === this.props.FAQHoveredID
            : false;

          if (isPaperQuestion(entity)) {
            return (
              <FAQ
                question={entity}
                isSelected={isSelected}
                isHovered={isHovered}
                entities={this.props.entities}
                handleJumpToEntity={this.props.handleJumpToEntity}
                handleMouseOver={this.props.handleMouseEnter}
                handleMouseOut={this.props.handleMouseLeave}
                handleClick={this.props.handleClick}
              />
            );
          }
        })
      : null;
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
      entities,
      selectedEntityIds,
    } = this.props;


    const FAQBarContainer = document.getElementById("FAQBar");

    const FAQs = this.getFAQs();

    const BarContent = (
      <div className="faq__content">
        {/* <p className="faq__content__header">FAQs</p> */}
        <p className="faq__content__header"> There is a lot of information in this paper, and some of it might not be useful to you.</p>

        <p className="faq__content__header"> To help out, we have highlighted some common questions that provide useful information in the paper. </p>

        <p className="faq__content__header"> Each question has a short answer here. Click on the "Jump to text" link to find sections relevant to that question in the paper.</p>

        <p className="faq__content__header"> Questions: </p>
        {' '}
        {FAQs}
      </div>
    );

    return FAQBarContainer
      ? ReactDOM.createPortal(BarContent, FAQBarContainer)
      : null;
  }
}

export default FAQBar;
