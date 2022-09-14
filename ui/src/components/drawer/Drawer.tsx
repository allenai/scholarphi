import MuiDrawer from "@mui/material/Drawer";
import React from "react";
import { FacetedHighlight, Entity, EntityUpdateData } from "../../api/types";
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
  facetedHighlights: FacetedHighlight[];
  allFacetedHighlights: FacetedHighlight[];
  propagateEntityEdits: boolean;
  highlightQuantity: { [facet: string]: number };
  showSkimmingAnnotationColors: boolean;
  handleClose: () => void;
  handleJumpToEntity: (entityId: string) => void;
  handleJumpToHighlight: (id: string) => void;
  handleSetPropagateEntityEdits: (propagate: boolean) => void;
  handleUpdateEntity: (
    entity: Entity,
    updates: EntityUpdateData
  ) => Promise<boolean>;
  handleDeleteEntity: (id: string) => Promise<boolean>;
  handleHighlightQuantityChanged: (highlightQuantity: {
    [facet: string]: number;
  }) => void;
  handleSkimmingAnnotationColorsChanged: (value: boolean) => void;
}

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
      facetedHighlights,
      allFacetedHighlights,
      highlightQuantity,
      showSkimmingAnnotationColors,
    } = this.props;

    let firstSelectedEntity: Entity | null = null;
    if (entities !== null && selectedEntityIds.length > 0) {
      firstSelectedEntity = entities.byId[selectedEntityIds[0]] || null;
    }

    if (pdfViewer != null) {
      if (mode === "open" && contentType !== null) {
        this.removePdfPositioningForDrawerOpen(pdfViewer.container);
        this.positionPdfForDrawerOpen(pdfViewer.container, contentType);
      } else {
        this.removePdfPositioningForDrawerOpen(pdfViewer.container);
      }
    }

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
              facetedHighlights={facetedHighlights}
              allFacetedHighlights={allFacetedHighlights}
              highlightQuantity={highlightQuantity}
              showSkimmingAnnotationColors={showSkimmingAnnotationColors}
              handleJumpToHighlight={this.props.handleJumpToHighlight}
              handleHighlightQuantityChanged={
                this.props.handleHighlightQuantityChanged
              }
              handleSkimmingAnnotationColorsChanged={
                this.props.handleSkimmingAnnotationColorsChanged
              }
            />
          )}
        </div>
      </MuiDrawer>
    );
  }
}

export default Drawer;
