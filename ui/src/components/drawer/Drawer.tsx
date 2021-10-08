import MuiDrawer from "@material-ui/core/Drawer";
import React from "react";
import { DiscourseObj, Entity, EntityUpdateData } from "../../api/types";
import { getRemoteLogger } from "../../logging";
import { Entities } from "../../state";
import { PDFViewer } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";
import EntityPropertyEditor from "../control/EntityPropertyEditor";
import { DefiningFormulas } from "./DefiningFormulas";
import Definitions from "./Definitions";
import Facets from "./Facets";
import Usages from "./Usages";

const logger = getRemoteLogger();

export type DrawerMode = "open" | "closed";
export type DrawerContentType =
  | "definitions"
  | "defining-formulas"
  | "usages"
  | "facets"
  | "entity-property-editor"
  | null;

interface Props {
  pdfViewer: PDFViewer;
  mode: DrawerMode;
  contentType: DrawerContentType;
  entities: Entities | null;
  selectedEntityIds: string[];
  discourseObjs: DiscourseObj[];
  deselectedDiscourses: string[];
  propagateEntityEdits: boolean;
  handleDiscourseSelected: (discourse: string) => void;
  handleClose: () => void;
  handleJumpToEntity: (entityId: string) => void;
  handleJumpToDiscourseObj: (id: string) => void;
  handleSetPropagateEntityEdits: (propagate: boolean) => void;
  handleUpdateEntity: (
    entity: Entity,
    updates: EntityUpdateData
  ) => Promise<boolean>;
  handleDeleteEntity: (id: string) => Promise<boolean>;
}

const SCROLLBAR_ELEMENT_SELECTORS = [".scrollbar-markup"];
export class Drawer extends React.PureComponent<Props> {
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

  componentDidUpdate = (prevProps: Props) => {
    const { pdfViewer } = this.props;
    if (prevProps.mode === "open" && this.props.mode === "closed") {
      this.removePdfPositioningForDrawerOpen(pdfViewer.container);
    }
    // SOMETHING IS WRONG WITH THE SCALING... I AM THINKING THAT I MIGHT
    // PREFER AN IMPLEMENTATION THAT SCROLLS THE PAPER LEFTWARDS...
    // I DO NOT THINK THE ORIGINAL PAPER IS VISIBLE AT THE SAME TIME AS
    // THE DISCOURSE OBJECTS ON MY SCREEN.

    // TODO; make so it only shifts if some of the sentences will be occluded.
    if (prevProps.mode === "closed" && this.props.mode === "open") {
      const page = document.querySelector(".page");
      if (page !== null) {
        const DRAWER_WIDTH = 380;
        const updatedViewportWidth =
          pdfViewer.container.getBoundingClientRect().width - DRAWER_WIDTH;
        const width = page.getBoundingClientRect().width;
        if (width > updatedViewportWidth) {
          const rightOffset =
            pdfViewer.container.getBoundingClientRect().right -
            page.getBoundingClientRect().right;
          const leftOffset =
            page.getBoundingClientRect().left -
            pdfViewer.container.getBoundingClientRect().left;
          const occlusion = DRAWER_WIDTH - Math.max(rightOffset, 0);
          const compensatingSpace =
            Math.max(rightOffset, 0) + Math.max(leftOffset, 0);
          const adjust = occlusion - compensatingSpace;
          const currentScale = (pdfViewer as any).currentScale;
          const newScale = currentScale * ((width - adjust) / width);
          if (Math.abs(newScale - currentScale) >= 0.05) {
            setTimeout(() => {
              (pdfViewer as any)._setScale(newScale);
            }, 50);
          }
        }
      }

      pdfViewer.container.classList.add(`drawer-${this.props.contentType}`);
      for (const selector of SCROLLBAR_ELEMENT_SELECTORS) {
        const element = window.document.querySelector(selector);
        if (element !== null) {
          element.classList.add("drawer-open");
        }
      }
    }
  };

  positionPdfForDrawerOpen = (
    pdfViewerContainer: HTMLElement,
    drawerContentType: string
  ) => {};

  removePdfPositioningForDrawerOpen(pdfViewerContainer: HTMLElement) {
    pdfViewerContainer.classList.forEach((c) => {
      if (c.indexOf("drawer-") !== -1) {
        pdfViewerContainer.classList.remove(c);
      }
    });
    for (const selector of SCROLLBAR_ELEMENT_SELECTORS) {
      const element = window.document.querySelector(selector);
      if (element !== null) {
        element.classList.remove("drawer-open");
      }
    }
  }

  closeDrawer() {
    if (this.props.mode !== "closed") {
      this.props.handleClose();
    }
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
      discourseObjs,
      deselectedDiscourses,
    } = this.props;

    let firstSelectedEntity: Entity | null = null;
    if (entities !== null && selectedEntityIds.length > 0) {
      firstSelectedEntity = entities.byId[selectedEntityIds[0]] || null;
    }

    // if (pdfViewer != null) {
    //   if (mode === "open" && contentType !== null) {
    //     this.removePdfPositioningForDrawerOpen(pdfViewer.container);
    //     this.positionPdfForDrawerOpen(pdfViewer.container, contentType);
    //   } else {
    //     this.removePdfPositioningForDrawerOpen(pdfViewer.container);
    //   }
    // }

    return (
      <MuiDrawer
        className="drawer"
        variant="persistent"
        anchor="right"
        /*
         * If for the drawer has been requested to open but there's nothing to show
         * in it, don't show it.
         */
        open={mode === "open" && contentType !== null}
        onScroll={this.onScroll}
        transitionDuration={0}
      >
        <div className="drawer__content">
          {contentType === "entity-property-editor" && (
            <EntityPropertyEditor
              /*
               * When the selected entity changes, clear the property editor.
               */
              key={
                firstSelectedEntity !== null
                  ? firstSelectedEntity.id
                  : undefined
              }
              entity={firstSelectedEntity}
              propagateEntityEdits={this.props.propagateEntityEdits}
              handleSetPropagateEntityEdits={
                this.props.handleSetPropagateEntityEdits
              }
              handleSaveChanges={this.props.handleUpdateEntity}
              handleDeleteEntity={this.props.handleDeleteEntity}
            />
          )}
          {contentType === "defining-formulas" && entities !== null && (
            <DefiningFormulas
              selectedEntityIds={selectedEntityIds}
              entities={entities}
              handleJumpToEntity={this.props.handleJumpToEntity}
            />
          )}
          {contentType === "usages" && entities !== null && (
            <Usages
              selectedEntityIds={selectedEntityIds}
              entities={entities}
              handleJumpToEntity={this.props.handleJumpToEntity}
            />
          )}
          {contentType === "definitions" && entities !== null && (
            <Definitions
              selectedEntityIds={selectedEntityIds}
              entities={entities}
              handleJumpToEntity={this.props.handleJumpToEntity}
            />
          )}
          {contentType === "facets" && (
            <Facets
              discourseObjs={discourseObjs}
              deselectedDiscourses={deselectedDiscourses}
              handleJumpToDiscourseObj={this.props.handleJumpToDiscourseObj}
              handleDiscourseSelected={this.props.handleDiscourseSelected}
            />
          )}
        </div>
      </MuiDrawer>
    );
  }
}

export default Drawer;
