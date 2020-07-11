import MuiDrawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import EntityPropertyEditor from "./EntityPropertyEditor";
import FeedbackButton from "./FeedbackButton";
import PaperList from "./PaperList";
import SearchResults from "./SearchResults";
import * as selectors from "./selectors";
import { Entities, PaperId, Papers, UserLibrary } from "./state";
import { Entity, EntityUpdateData, isCitation } from "./types/api";
import { PDFViewer } from "./types/pdfjs-viewer";

const PDF_VIEWER_DRAWER_OPEN_CLASS = "drawer-open";

export type DrawerMode = "open" | "closed";

interface Props {
  paperId: PaperId | undefined;
  pdfViewer: PDFViewer;
  pdfDocument: PDFDocumentProxy | null;
  mode: DrawerMode;
  papers: Papers | null;
  entities: Entities | null;
  userLibrary: UserLibrary | null;
  selectedEntityId: string | null;
  entityEditingEnabled: boolean;
  handleClose: () => void;
  handleSelectSymbol: (id: string) => void;
  handleScrollSymbolIntoView: () => void;
  handleAddPaperToLibrary: (paperId: string, paperTitle: string) => void;
  handleUpdateEntity: (entity: EntityUpdateData) => void;
}

export class Drawer extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.closeDrawer = this.closeDrawer.bind(this);
  }

  componentWillUnmount() {
    const { pdfViewer } = this.props;
    if (pdfViewer != null) {
      this.removePdfPositioningForDrawerOpen(pdfViewer.viewer);
    }
  }

  positionPdfForDrawerOpen(pdfViewerContainer: HTMLElement) {
    /*
     * Creating padding for scroll
     */
    Array.from(pdfViewerContainer.children).forEach((page) => {
      // XXX(zkirby, andrewhead) per our discussion at https://github.com/allenai/scholar-reader/pull/38/files#r388514946
      // this is 'safe' as pages are not deleted when scrolled out of view (just their inner content).
      page.classList.add(PDF_VIEWER_DRAWER_OPEN_CLASS);
    });

    const { mode, selectedEntityId, entities } = this.props;
    if (
      mode === "open" &&
      selectors.selectedEntityType(selectedEntityId, entities) === "symbol"
    ) {
      this.props.handleScrollSymbolIntoView();
    }
  }

  removePdfPositioningForDrawerOpen(pdfViewerContainer: HTMLElement) {
    Array.from(pdfViewerContainer.children).forEach((page) => {
      page.classList.remove(PDF_VIEWER_DRAWER_OPEN_CLASS);
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
      paperId,
      pdfViewer,
      pdfDocument,
      mode,
      entities,
      selectedEntityId,
      entityEditingEnabled,
      handleSelectSymbol,
    } = this.props;
    if (pdfViewer != null) {
      if (mode === "open") {
        this.positionPdfForDrawerOpen(pdfViewer.viewer);
      } else {
        this.removePdfPositioningForDrawerOpen(pdfViewer.viewer);
      }
    }

    const feedbackContext = {
      mode,
      selectedEntityId,
    };

    let selectedEntity: Entity | null = null;
    if (entities !== null && selectedEntityId !== null) {
      selectedEntity = entities.byId[selectedEntityId] || null;
    }

    return (
      <MuiDrawer
        className="drawer"
        variant="persistent"
        anchor="right"
        open={mode !== "closed" || entityEditingEnabled}
      >
        <div className="drawer__header">
          <div className="drawer__close_icon">
            <IconButton
              className="MuiButton-contained"
              onClick={this.closeDrawer}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
          <FeedbackButton paperId={paperId} extraContext={feedbackContext} />
        </div>
        <div className="drawer__content">
          {mode === "open" &&
            entityEditingEnabled === false &&
            selectors.selectedEntityType(selectedEntityId, entities) ===
              "symbol" &&
            pdfDocument !== null && (
              <SearchResults
                pdfDocument={pdfDocument}
                pageSize={4}
                entities={entities}
                selectedEntityId={selectedEntityId}
                handleSelectSymbol={handleSelectSymbol}
              />
            )}
          {mode === "open" &&
            entityEditingEnabled === false &&
            entities !== null &&
            selectors.selectedEntityType(selectedEntityId, entities) ===
              "citation" &&
            selectedEntityId !== null &&
            isCitation(entities.byId[selectedEntityId]) && (
              <PaperList
                papers={this.props.papers}
                userLibrary={this.props.userLibrary}
                handleAddPaperToLibrary={this.props.handleAddPaperToLibrary}
              />
            )}
          {entityEditingEnabled === true &&
            selectedEntityId !== null &&
            selectedEntity !== null && (
              <EntityPropertyEditor
                /*
                 * When the selected entity changes, clear the property editor.
                 */
                key={selectedEntityId}
                entity={selectedEntity}
                handleSaveChanges={this.props.handleUpdateEntity}
              />
            )}
        </div>
      </MuiDrawer>
    );
  }
}

export default Drawer;
