import React from "react";
import * as api from "./api";
import AppOverlay from "./AppOverlay";
import { AreaSelectionMethod } from "./EntityCreationToolbar";
import { FindQuery } from "./FindBar";
import PageOverlay from "./PageOverlay";
import * as selectors from "./selectors";
import { matchingSymbols } from "./selectors";
import { KnownEntityType, Pages, PaperId, State, SymbolFilters } from "./state";
import "./style/index.less";
import {
  BoundingBox,
  EntityCreateData,
  EntityUpdateData,
  isCitation,
  Paper,
} from "./types/api";
import {
  DocumentLoadedEvent,
  PageRenderedEvent,
  PDFViewerApplication,
} from "./types/pdfjs-viewer";
import * as stateUtils from "./utils/state";
import * as uiUtils from "./utils/ui";
import ViewerOverlay from "./ViewerOverlay";

interface Props {
  paperId?: PaperId;
}

class ScholarReader extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      entities: null,
      papers: null,

      userLibrary: null,

      pages: null,
      pdfViewerApplication: null,
      pdfDocument: null,
      pdfViewer: null,

      annotationsShowing: true,
      selectedAnnotationId: null,
      selectedAnnotationSpanId: null,
      selectedEntityId: null,

      isFindActive: false,
      findMode: null,
      findActivationTimeMs: null,
      findQuery: null,
      findMatchIndex: null,
      findMatchCount: null,
      findMatchedEntities: null,
      drawerMode: "closed",
      snackbarMode: "closed",
      snackbarActivationTimeMs: null,
      snackbarMessage: null,

      entityCreationEnabled: false,
      entityCreationAreaSelectionMethod: "text-selection",
      entityCreationType: "term",
      entityEditingEnabled: false,
    };

    /**
     * Bind state-changing handlers so that they will be called with 'this' as its context.
     * See https://reactjs.org/docs/faq-functions.html#how-do-i-bind-a-function-to-a-component-instance
     */
    this.createEntity = this.createEntity.bind(this);
    this.updateEntity = this.updateEntity.bind(this);
    this.deleteEntity = this.deleteEntity.bind(this);
    this.addToLibrary = this.addToLibrary.bind(this);

    this.selectEntity = this.selectEntity.bind(this);
    this.selectEntityAnnotation = this.selectEntityAnnotation.bind(this);
    this.deselectSelection = this.deselectSelection.bind(this);

    this.hideAnnotations = this.hideAnnotations.bind(this);
    this.showAnnotations = this.showAnnotations.bind(this);
    this.scrollSymbolIntoView = this.scrollSymbolIntoView.bind(this);
    this.showSnackbarMessage = this.showSnackbarMessage.bind(this);
    this.closeSnackbar = this.closeSnackbar.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.startTextSearch = this.startTextSearch.bind(this);
    this.startSymbolSearch = this.startSymbolSearch.bind(this);
    this.setFindMatchCount = this.setFindMatchCount.bind(this);
    this.setFindMatchIndex = this.setFindMatchIndex.bind(this);
    this.setFindQuery = this.setFindQuery.bind(this);
    this.closeFindBar = this.closeFindBar.bind(this);
    this.toggleEntityCreationMode = this.toggleEntityCreationMode.bind(this);
    this.setEntityCreationType = this.setEntityCreationType.bind(this);
    this.setEntityCreationAreaSelectionMethod = this.setEntityCreationAreaSelectionMethod.bind(
      this
    );
    this.toggleEntityEditMode = this.toggleEntityEditMode.bind(this);
  }

  async addToLibrary(paperId: string, paperTitle: string) {
    if (this.props.paperId) {
      const response = await api.addLibraryEntry(paperId, paperTitle);

      if (!response) {
        // Request failed, throw an error
        throw new Error("Failed to add entry to library.");
      }

      const userLibrary = this.state.userLibrary;
      if (userLibrary) {
        const paperIds = userLibrary.paperIds.concat(paperId);
        this.setState({ userLibrary: { ...userLibrary, paperIds } });
      }
    }
  }

  selectEntity(id: string | null) {
    this.setState({ selectedEntityId: id });
  }

  selectEntityAnnotation(
    entityId: string | null,
    annotationId: string | null,
    annotationSpanId: string | null
  ) {
    if (this.state.entities === null) {
      return;
    }

    if (
      entityId === null ||
      this.state.entities.byId[entityId].type !== "symbol"
    ) {
      this.setState({
        selectedEntityId: entityId,
        selectedAnnotationId: annotationId,
        selectedAnnotationSpanId: annotationSpanId,
      });
      return;
    }

    /*
     * If this is a symbol, start a search for symbols.
     */
    const matching = matchingSymbols(entityId, this.state.entities);
    const matchCount = matching.length;
    const matchIndex = matching.indexOf(entityId);
    this.setState({
      selectedEntityId: entityId,
      selectedAnnotationId: annotationId,
      selectedAnnotationSpanId: annotationSpanId,
      isFindActive: true,
      findMode: "symbol",
      findActivationTimeMs: Date.now(),
      findQuery: {
        byId: {
          "exact-match": {
            key: "exact-match",
          },
          "partial-match": {
            key: "partial-match",
          },
        },
        all: ["exact-match", "partial-match"],
      },
      findMatchCount: matchCount,
      findMatchIndex: matchIndex,
      findMatchedEntities: matching,
    });
  }

  deselectSelection() {
    if (this.state.findMode === "symbol") {
      this.closeFindBar();
    }
    this.setState({
      selectedAnnotationId: null,
      selectedAnnotationSpanId: null,
      selectedEntityId: null,
    });
  }

  /**
   * Will scroll a symbol horizontally into view when the drawer opens
   * if it is now obscured by the drawer.
   */
  scrollSymbolIntoView() {
    const { selectedEntityId, pdfViewer, entities, pages } = this.state;
    const DRAWER_WIDTH = 470;
    const SYMBOL_VIEW_PADDING = 50;
    if (
      pdfViewer &&
      pages !== null &&
      entities !== null &&
      selectedEntityId !== null
    ) {
      const symbol = entities.byId[selectedEntityId];
      const symbolBox = symbol.attributes.bounding_boxes[0];
      const pdfLeft = pdfViewer.container.getBoundingClientRect().left;
      if (pages[symbolBox.page + 1].view != null) {
        const { left, width } = selectors.divDimensionStyles(
          pages[symbolBox.page + 1].view,
          symbolBox
        );
        /*
         * Each component of the calculation:
         * left + width = right position on the pdf page of the selected symbol
         * scrollLeft = how much the pdf has been scrolled left already
         * pdfLeft = how far to the left the pdf is relative to the viewport
         * ----------------
         * innerWidth = possible visible area of the viewport for the entire website
         * 470 = width of the drawer that is now obscuring the view
         */
        const relativeSymbolRightPosition =
          left + width - pdfViewer.container.scrollLeft + pdfLeft;
        const viewableViewportWidth = window.innerWidth - DRAWER_WIDTH;
        if (relativeSymbolRightPosition > viewableViewportWidth) {
          // Add 50px padding to make the symbol close to the drawer but not hidden by it.
          pdfViewer.container.scrollLeft += Math.max(
            relativeSymbolRightPosition -
              viewableViewportWidth +
              SYMBOL_VIEW_PADDING,
            0
          );
        }
      }
    }
  }

  setEntityCreationType(type: KnownEntityType) {
    this.setState({ entityCreationType: type });
  }

  setEntityCreationAreaSelectionMethod(method: AreaSelectionMethod) {
    this.setState({ entityCreationAreaSelectionMethod: method });
  }

  async createEntity(data: EntityCreateData) {
    if (this.props.paperId !== undefined) {
      const createdEntity = await api.postEntity(this.props.paperId.id, data);
      if (createdEntity !== null) {
        this.setState((prevState) => ({
          /*
           * Add the entity to memory
           */
          entities:
            prevState.entities !== null
              ? stateUtils.add(
                  prevState.entities,
                  createdEntity.id,
                  createdEntity
                )
              : null,
          /*
           * Select the new entity
           */
          selectedEntityId: createdEntity.id,
        }));
        return true;
      }
    }
    return false;
  }

  async updateEntity(data: EntityUpdateData): Promise<boolean> {
    if (this.props.paperId !== undefined) {
      const result = await api.patchEntity(this.props.paperId.id, data);
      if (result) {
        /*
         * Update the entity in memory.
         */
        this.setState((prevState) => {
          if (prevState.entities !== null) {
            const entity = prevState.entities.byId[data.id];
            const updated = {
              ...entity,
              attributes: { ...entity.attributes, ...data.attributes },
              relationships: { ...entity.relationships, ...data.relationships },
            };
            return {
              entities: stateUtils.update(prevState.entities, data.id, updated),
            };
          }
          return { entities: prevState.entities };
        });
        return true;
      }
    }
    return false;
  }

  async deleteEntity(id: string) {
    if (this.props.paperId !== undefined) {
      const result = await api.deleteEntity(this.props.paperId.id, id);
      if (result) {
        this.setState((prevState) => {
          /*
           * Delete the entity from memory.
           */
          const updatedEntities =
            prevState.entities !== null
              ? stateUtils.del(prevState.entities, id)
              : null;

          /*
           * Deselect the entiti if it's currently selected.
           */
          let selectionState;
          if (prevState.selectedEntityId === id) {
            selectionState = {
              selectedEntityId: null,
              selectedAnnotationId: null,
              selectedAnnotationSpanId: null,
            };
          } else {
            selectionState = {
              selectedEntityId: prevState.selectedEntityId,
              selectedAnnotationId: prevState.selectedAnnotationId,
              selectedAnnotationSpanId: prevState.selectedAnnotationSpanId,
            };
          }

          return { ...selectionState, entities: updatedEntities };
        });
        return true;
      }
    }
    return false;
  }

  showSnackbarMessage(message: string) {
    this.setState({
      snackbarMode: "open",
      snackbarActivationTimeMs: Date.now(),
      snackbarMessage: message,
    });
  }

  closeSnackbar() {
    this.setState({
      snackbarMode: "closed",
      snackbarActivationTimeMs: null,
      snackbarMessage: null,
    });
  }

  closeDrawer() {
    this.setState({ drawerMode: "closed" });
  }

  hideAnnotations() {
    this.setState({ annotationsShowing: false });
  }

  showAnnotations() {
    this.setState({ annotationsShowing: true });
  }

  toggleEntityCreationMode() {
    this.setState((prevState) => ({
      entityCreationEnabled: !prevState.entityCreationEnabled,
    }));
  }

  toggleEntityEditMode() {
    this.setState((prevState) => {
      const entityEditingEnabled = !prevState.entityEditingEnabled;
      /*
       * Open drawer if editing just enabled and drawer was closed.
       */
      const drawerMode =
        entityEditingEnabled && prevState.drawerMode !== "open"
          ? "open"
          : prevState.drawerMode;
      return {
        entityEditingEnabled,
        drawerMode,
      };
    });
  }

  startTextSearch() {
    this.setState({
      isFindActive: true,
      findActivationTimeMs: Date.now(),
      findMode: "pdfjs-builtin-find",
    });
  }

  startSymbolSearch(symbolId: string) {}

  setFindMatchCount(findMatchCount: number | null) {
    this.setState({ findMatchCount });
  }

  setFindMatchIndex(findMatchIndex: number | null) {
    this.setState((state) => {
      if (
        state.findMode === "symbol" &&
        state.findMatchedEntities !== null &&
        findMatchIndex !== null &&
        state.entities !== null
      ) {
        const symbolId = state.findMatchedEntities[findMatchIndex];
        const symbol = state.entities.byId[symbolId];
        this.jumpToBoundingBox(symbol.attributes.bounding_boxes[0]);
      }
      return { findMatchIndex };
    });
  }

  setFindQuery(findQuery: FindQuery) {
    this.setState((state) => {
      if (
        state.findMode === "symbol" &&
        state.selectedEntityId !== null &&
        state.entities !== null
      ) {
        const symbolFilters = findQuery as SymbolFilters;
        const filterList =
          symbolFilters !== null
            ? Object.values(symbolFilters.byId)
            : undefined;
        const matching = matchingSymbols(
          state.selectedEntityId,
          state.entities,
          filterList
        );
        const matchCount = matching.length;
        const matchIndex = matching.indexOf(state.selectedEntityId);
        return {
          findQuery,
          findMatchCount: matchCount,
          findMatchIndex: matchIndex,
          findMatchedEntities: matching,
        } as State;
      }
      return { findQuery } as State;
    });
  }

  closeFindBar() {
    this.setState({
      isFindActive: false,
      findActivationTimeMs: null,
      findMode: null,
      findQuery: null,
      findMatchCount: null,
      findMatchIndex: null,
      findMatchedEntities: null,
    });
  }

  async componentDidMount() {
    waitForPDFViewerInitialization().then((application) => {
      /*
       * Tell pdf.js not to use default find functionality, but instead to forward find events
       * to external services. The events are intercepted in 'FindBar'.
       */
      application.externalServices.supportsIntegratedFind = true;

      this.setState({ pdfViewerApplication: application });
      this.subscribeToPDFViewerStateChanges(application);
    });
    this.loadDataFromApi();
  }

  subscribeToPDFViewerStateChanges(pdfViewerApplication: PDFViewerApplication) {
    const { eventBus, pdfDocument, pdfViewer } = pdfViewerApplication;

    if (pdfDocument !== null) {
      this.setState({ pdfDocument });
    }
    if (pdfViewer !== null) {
      this.setState({ pdfViewer });
    }
    eventBus.on("documentloaded", (eventData: DocumentLoadedEvent) => {
      this.setState({ pdfDocument: eventData.source });
    });

    /*
     * TODO(andrewhead): Do we need to add pages that are *already loaded* at initialization time
     * to the state? Or will 'pagerendered' always run after this component is mounted?
     */
    eventBus.on("pagerendered", (eventData: PageRenderedEvent) => {
      this.setState({
        pdfDocument: pdfViewerApplication.pdfDocument,
        pages: {
          ...this.state.pages,
          [eventData.pageNumber]: {
            timeOfLastRender: eventData.timestamp,
            view: eventData.source,
          },
        },
      });
    });
  }

  async loadDataFromApi() {
    if (this.props.paperId !== undefined) {
      if (this.props.paperId.type === "arxiv") {
        const entities = await api.getEntities(this.props.paperId.id);
        this.setState({
          entities: stateUtils.createRelationalStoreFromArray(entities, "id"),
        });

        const citationS2Ids = entities
          .filter(isCitation)
          .map((c) => c.attributes.paper_id)
          .filter((id) => id !== null)
          .map((id) => id as string);
        if (citationS2Ids.length >= 1) {
          const papers = (await api.getPapers(citationS2Ids)).reduce(
            (papers, paper) => {
              papers[paper.s2Id] = paper;
              return papers;
            },
            {} as { [s2Id: string]: Paper }
          );
          this.setState({ papers });
        }

        const userLibrary = await api.getUserLibraryInfo();
        if (userLibrary) {
          this.setState({ userLibrary });
        }
      }
    }
  }

  jumpToBoundingBox(box: BoundingBox) {
    /*
     * In a past version, these offsets were based roughly off those in the pdf.js "find" functionality:
     * https://github.com/mozilla/pdf.js/blob/16ae7c6960c1296370c1600312f283a68e82b137/web/pdf_find_controller.js#L28-L29
     */
    const SCROLL_OFFSET_X = -200;
    const SCROLL_OFFSET_Y = +100;

    if (
      this.state.pdfViewer !== null &&
      this.state.pages !== null &&
      this.state.pages[box.page + 1] !== undefined
    ) {
      const page = this.state.pages[box.page + 1];
      const { left, top } = uiUtils.convertBoxToPdfCoordinates(page.view, box);
      this.state.pdfViewer.scrollPageIntoView({
        pageNumber: box.page + 1,
        destArray: [
          undefined,
          { name: "XYZ" },
          left + SCROLL_OFFSET_X,
          top + SCROLL_OFFSET_Y,
        ],
      });
    }
  }

  render() {
    let findMatchEntityId: string | null = null;
    if (
      this.state.findMatchedEntities !== null &&
      this.state.findMatchIndex !== null &&
      this.state.findMatchIndex < this.state.findMatchedEntities.length
    ) {
      findMatchEntityId = this.state.findMatchedEntities[
        this.state.findMatchIndex
      ];
    }

    return (
      <>
        {this.state.pdfViewerApplication !== null &&
        this.state.pdfViewer !== null ? (
          <>
            {/* Render the widgets and event handlers for the entire app and viewer containers. */}
            <AppOverlay
              appContainer={document.body}
              paperId={this.props.paperId}
              entityCreationEnabled={this.state.entityCreationEnabled}
              snackbarMode={this.state.snackbarMode}
              snackbarActivationTimeMs={this.state.snackbarActivationTimeMs}
              snackbarMessage={this.state.snackbarMessage}
              handleHideAnnotations={this.hideAnnotations}
              handleShowAnnotations={this.showAnnotations}
              handleDeselectSelection={this.deselectSelection}
              handleStartTextSearch={this.startTextSearch}
              handleTerminateSearch={this.closeFindBar}
              handleCloseSnackbar={this.closeSnackbar}
              handleCloseDrawer={this.closeDrawer}
              handleToggleEntityCreationMode={this.toggleEntityCreationMode}
              handleToggleEntityEditMode={this.toggleEntityEditMode}
            />
            <ViewerOverlay
              pdfViewerApplication={this.state.pdfViewerApplication}
              pdfViewer={this.state.pdfViewer}
              pdfDocument={this.state.pdfDocument}
              pages={this.state.pages}
              paperId={this.props.paperId}
              papers={this.state.papers}
              entities={this.state.entities}
              userLibrary={this.state.userLibrary}
              selectedEntityId={this.state.selectedEntityId}
              entityCreationEnabled={this.state.entityCreationEnabled}
              entityCreationType={this.state.entityCreationType}
              entityCreationAreaSelectionMethod={
                this.state.entityCreationAreaSelectionMethod
              }
              entityEditingEnabled={this.state.entityEditingEnabled}
              isFindActive={this.state.isFindActive}
              findActivationTimeMs={this.state.findActivationTimeMs}
              findMode={this.state.findMode}
              findQuery={this.state.findQuery}
              findMatchIndex={this.state.findMatchIndex}
              findMatchCount={this.state.findMatchCount}
              drawerMode={this.state.drawerMode}
              handleShowSnackbarMessage={this.showSnackbarMessage}
              handleDeselectSelection={this.deselectSelection}
              handleChangeMatchIndex={this.setFindMatchIndex}
              handleChangeMatchCount={this.setFindMatchCount}
              handleChangeQuery={this.setFindQuery}
              handleCloseFindBar={this.closeFindBar}
              handleCloseDrawer={this.closeDrawer}
              handleScrollSymbolIntoView={this.scrollSymbolIntoView}
              handleAddPaperToLibrary={this.addToLibrary}
              handleSelectEntity={this.selectEntity}
              handleCreateEntity={this.createEntity}
              handleUpdateEntity={this.updateEntity}
              handleDeleteEntity={this.deleteEntity}
              handleSelectEntityCreationType={this.setEntityCreationType}
              handleSelectEntityCreationAreaSelectionMethod={
                this.setEntityCreationAreaSelectionMethod
              }
            />
          </>
        ) : null}
        {this.state.pages !== null ? (
          <>
            {/* Add overlays (e.g., annotations, etc.) atop each page. */}
            {Object.keys(this.state.pages).map((pageNumberKey) => {
              const pages = this.state.pages as Pages;
              const pageNumber = Number(pageNumberKey);
              const pageModel = pages[pageNumber];
              /*
               * By setting the key to the page number *and* the timestamp it was rendered, React will
               * know to replace a page overlay when a pdf.js re-renders a page.
               */
              const key = `${pageNumber}-${pageModel.timeOfLastRender}`;
              return (
                <PageOverlay
                  key={key}
                  paperId={this.props.paperId}
                  view={pageModel.view}
                  pageNumber={pageNumber}
                  papers={this.state.papers}
                  entities={this.state.entities}
                  userLibrary={this.state.userLibrary}
                  selectedEntityId={this.state.selectedEntityId}
                  selectedAnnotationId={this.state.selectedAnnotationId}
                  selectedAnnotationSpanId={this.state.selectedAnnotationSpanId}
                  findMatchedEntityIds={this.state.findMatchedEntities}
                  findSelectionEntityId={findMatchEntityId}
                  showAnnotations={this.state.annotationsShowing}
                  entityCreationEnabled={this.state.entityCreationEnabled}
                  entityCreationType={this.state.entityCreationType}
                  entityCreationAreaSelectionMethod={
                    this.state.entityCreationAreaSelectionMethod
                  }
                  entityEditingEnabled={this.state.entityEditingEnabled}
                  handleSelectEntityAnnotation={this.selectEntityAnnotation}
                  handleShowSnackbarMessage={this.showSnackbarMessage}
                  handleStartSymbolSearch={this.startSymbolSearch}
                  handleAddPaperToLibrary={this.addToLibrary}
                  handleCreateEntity={this.createEntity}
                  handleUpdateEntity={this.updateEntity}
                  handleDeleteEntity={this.deleteEntity}
                />
              );
            })}
          </>
        ) : null}
      </>
    );
  }
}

async function waitForPDFViewerInitialization() {
  return new Promise<PDFViewerApplication>((resolve) => {
    const CHECK_CYCLE_MS = 50;
    function check() {
      if (
        window.PDFViewerApplication !== undefined &&
        window.PDFViewerApplication.initialized
      ) {
        resolve(window.PDFViewerApplication);
      } else {
        setTimeout(check, CHECK_CYCLE_MS);
      }
    }
    check();
  });
}

export default ScholarReader;
