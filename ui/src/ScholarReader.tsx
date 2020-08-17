import classNames from "classnames";
import React from "react";
import * as api from "./api";
import AppOverlay from "./AppOverlay";
import Control from "./Control";
import DefinitionPreview from "./DefinitionPreview";
import { Drawer } from "./Drawer";
import EntityCreationToolbar, {
  AreaSelectionMethod,
  createCreateEntityDataWithBoxes,
} from "./EntityCreationToolbar";
import FindBar, { FindQuery } from "./FindBar";
import { getRemoteLogger } from "./logging";
import MasterControlPanel from "./MasterControlPanel";
import PageOverlay from "./PageOverlay";
import PdfjsToolbar from "./PdfjsToolbar";
import PrimerPage from "./PrimerPage";
import * as selectors from "./selectors";
import { matchingSymbols } from "./selectors";
import { ConfigurableSetting, CONFIGURABLE_SETTINGS } from "./settings";
import { KnownEntityType, Pages, PaperId, State, SymbolFilters } from "./state";
import "./style/index.less";
import TextSelectionMenu from "./TextSelectionMenu";
import {
  Entity,
  EntityCreateData,
  EntityUpdateData,
  isCitation,
  isSymbol,
  isTerm,
  Paper,
  Symbol,
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

      controlPanelShowing: false,

      selectedAnnotationIds: [],
      selectedAnnotationSpanIds: [],
      selectedEntityIds: [],
      multiselectEnabled: false,

      textSelection: null,
      textSelectionChangeMs: null,

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

      entityCreationAreaSelectionMethod: "text-selection",
      entityCreationType: "term",
      propagateEntityEdits: true,

      primerPageEnabled: true,
      annotationHintsEnabled: false,
      glossStyle: "sidenote",
      glossEvaluationEnabled: true,
      textSelectionMenuEnabled: false,
      symbolSearchEnabled: true,
      declutterEnabled: true,
      definitionPreviewEnabled: false,
      equationDiagramsEnabled: false,
      entityCreationEnabled: false,
      entityEditingEnabled: false,
      sentenceTexCopyOnOptionClickEnabled: false,
    };

    /**
     * Bind state-changing handlers so that they will be called with 'this' as its context.
     * See https://reactjs.org/docs/faq-functions.html#how-do-i-bind-a-function-to-a-component-instance
     */
    this.toggleControlPanelShowing = this.toggleControlPanelShowing.bind(this);
    this.toggleAnnotationHints = this.toggleAnnotationHints.bind(this);
    this.closeControlPanel = this.closeControlPanel.bind(this);
    this.handleChangeSetting = this.handleChangeSetting.bind(this);

    this.createEntity = this.createEntity.bind(this);
    this.createParentSymbol = this.createParentSymbol.bind(this);
    this.updateEntity = this.updateEntity.bind(this);
    this.deleteEntity = this.deleteEntity.bind(this);
    this.addToLibrary = this.addToLibrary.bind(this);

    this.setTextSelection = this.setTextSelection.bind(this);
    this.selectEntity = this.selectEntity.bind(this);
    this.selectEntityAnnotation = this.selectEntityAnnotation.bind(this);
    this.clearEntitySelection = this.clearEntitySelection.bind(this);

    this.setMultiselectEnabled = this.setMultiselectEnabled.bind(this);
    this.scrollSymbolIntoView = this.scrollSymbolIntoView.bind(this);
    this.showSnackbarMessage = this.showSnackbarMessage.bind(this);
    this.closeSnackbar = this.closeSnackbar.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.startTextSearch = this.startTextSearch.bind(this);
    this.setFindMatchCount = this.setFindMatchCount.bind(this);
    this.setFindMatchIndex = this.setFindMatchIndex.bind(this);
    this.setFindQuery = this.setFindQuery.bind(this);
    this.closeFindBar = this.closeFindBar.bind(this);
    this.setEntityCreationType = this.setEntityCreationType.bind(this);
    this.setEntityCreationAreaSelectionMethod = this.setEntityCreationAreaSelectionMethod.bind(
      this
    );
    this.setPropagateEntityEdits = this.setPropagateEntityEdits.bind(this);
  }

  toggleControlPanelShowing() {
    this.setState((prevState) => ({
      controlPanelShowing: !prevState.controlPanelShowing,
    }));
  }

  toggleAnnotationHints() {
    this.setState((prevState) => ({
      annotationHintsEnabled: !prevState.annotationHintsEnabled,
    }));
  }

  closeControlPanel() {
    this.setState({ controlPanelShowing: false });
  }

  handleChangeSetting(setting: ConfigurableSetting, value: any) {
    this.setState({
      [setting.key]: value,
    } as State);
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

  setTextSelection(selection: Selection | null) {
    this.setState({
      textSelection: selection,
      textSelectionChangeMs: Date.now(),
    });
  }

  selectEntity(id: string) {
    this.setState({ selectedEntityIds: [id] });
  }

  selectEntityAnnotation(
    entityId: string,
    annotationId: string,
    annotationSpanId: string
  ) {
    this.setState((prevState) => {
      const prevEntities = prevState.entities;
      if (prevEntities === null) {
        return {};
      }

      const selectedEntityIds = prevState.multiselectEnabled
        ? [...prevState.selectedEntityIds]
        : [];
      const selectedAnnotationIds = prevState.multiselectEnabled
        ? [...prevState.selectedAnnotationIds]
        : [];
      const selectedAnnotationSpanIds = prevState.multiselectEnabled
        ? [...prevState.selectedAnnotationSpanIds]
        : [];
      if (selectedEntityIds.indexOf(entityId) === -1) {
        selectedEntityIds.push(entityId);
      }
      if (selectedAnnotationIds.indexOf(annotationId) === -1) {
        selectedAnnotationIds.push(annotationId);
      }
      if (selectedAnnotationSpanIds.indexOf(annotationSpanId) === -1) {
        selectedAnnotationSpanIds.push(annotationSpanId);
      }

      /*
       * The default behavior is to just update the selection. If the selection is a symbol,
       * however, start a symbol search.
       */
      if (prevEntities.byId[entityId].type !== "symbol") {
        return {
          selectedEntityIds,
          selectedAnnotationIds,
          selectedAnnotationSpanIds,
        } as State;
      }

      /*
       * If this is a symbol, start or update the search.
       */
      const symbolIds = selectedEntityIds.filter(
        (id) => prevEntities.byId[id].type === "symbol"
      );
      const matching = matchingSymbols(symbolIds, prevEntities);
      const matchCount = matching.length;
      const matchIndex = matching.indexOf(entityId);
      return {
        selectedEntityIds,
        selectedAnnotationIds,
        selectedAnnotationSpanIds,
        isFindActive: true,
        findMode: "symbol",
        findActivationTimeMs: Date.now(),
        findQuery: {
          byId: {
            [entityId]: {
              symbol: prevEntities.byId[entityId],
              active: true,
            },
          },
          all: [entityId],
        } as FindQuery,
        findMatchCount: matchCount,
        findMatchIndex: matchIndex,
        findMatchedEntities: matching,
      } as State;
    });
  }

  clearEntitySelection() {
    if (this.state.findMode === "symbol") {
      this.closeFindBar();
    }
    this.setState({
      selectedAnnotationIds: [],
      selectedAnnotationSpanIds: [],
      selectedEntityIds: [],
    });
  }

  /**
   * Will scroll a symbol horizontally into view when the drawer opens
   * if it is now obscured by the drawer.
   */
  scrollSymbolIntoView() {
    const { selectedEntityIds, pdfViewer, entities, pages } = this.state;
    const DRAWER_WIDTH = 470;
    const SYMBOL_VIEW_PADDING = 50;
    if (
      pdfViewer &&
      pages !== null &&
      entities !== null &&
      selectedEntityIds.length >= 1
    ) {
      const lastSelectedEntityId =
        selectedEntityIds[selectedEntityIds.length - 1];
      const symbol = entities.byId[lastSelectedEntityId];
      const symbolBox = symbol.attributes.bounding_boxes[0];
      const pdfLeft = pdfViewer.container.getBoundingClientRect().left;
      if (pages[symbolBox.page + 1].view != null) {
        const { left, width } = uiUtils.getPositionInPageView(
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
          selectedEntityIds: [createdEntity.id],
        }));
        return createdEntity.id;
      }
    }
    return null;
  }

  async createParentSymbol(childSymbols: Symbol[]) {
    /*
     * Parent bounding box is the union of child bounding boxes.
     */
    const childBoxes = childSymbols
      .map((c) => c.attributes.bounding_boxes)
      .flat();
    if (childBoxes.length === 0) {
      return false;
    }
    const left = Math.min(...childBoxes.map((b) => b.left));
    const top = Math.min(...childBoxes.map((b) => b.top));
    const right = Math.max(...childBoxes.map((b) => b.left + b.width));
    const bottom = Math.max(...childBoxes.map((b) => b.top + b.height));
    const parentBox = {
      left,
      top,
      width: right - left,
      height: bottom - top,
      page: childBoxes[0].page,
      source: "human-annotation",
    };

    /*
     * Transfer TeX and sentence references from children to parent. Attempt to create
     * parent TeX by removing TeX markers (e.g., leading and training '$') from child
     * TeX and then concatenating all child TeX.
     */
    const allChildTex = childSymbols
      .map((s) => s.attributes.tex || "")
      .map((tex) => tex.replace(/^\$*/, "").replace(/\$*$/, ""))
      .join(" ");
    const createEntityData = createCreateEntityDataWithBoxes(
      [parentBox],
      "symbol",
      allChildTex
    );
    const childIds = childSymbols.map((c) => c.id);
    const sentenceId =
      childSymbols
        .map((c) => c.relationships.sentence.id)
        .filter((id) => id !== null)[0] || null;
    createEntityData.relationships = {
      ...createEntityData.relationships,
      children: childIds.map((id) => ({ type: "symbol", id })),
      sentence: { type: "sentence", id: sentenceId },
    };

    /*
     * Create parent symbol.
     */
    const parentId = await this.createEntity(createEntityData);
    if (parentId === null) {
      return false;
    }

    /*
     * Update children to reference the parent.
     */
    for (const child of childSymbols) {
      const updateData = {
        id: child.id,
        type: "symbol",
        attributes: {
          source: "human-annotation",
        },
        relationships: {
          parent: { type: "symbol", id: parentId },
        },
      } as EntityUpdateData;
      const success = await this.updateEntity(child, updateData, false);
      if (!success) {
        return false;
      }
    }

    return true;
  }

  async updateEntity(
    entity: Entity,
    updateData: EntityUpdateData,
    propagateEdits?: boolean
  ): Promise<boolean> {
    const { paperId } = this.props;
    if (paperId === undefined) {
      return false;
    }

    /*
     * By default, only update this one entity. If edits are supposed to be
     * propagated to other matching entities, build a list matching entities to update.
     */
    const entitiesToPatch = [entity.id];
    const entities = this.state.entities;
    if (
      (propagateEdits === true ||
        (propagateEdits === undefined && this.state.propagateEntityEdits)) &&
      entities !== null
    ) {
      entitiesToPatch.push(
        ...entities.all
          .map((id) => entities.byId[id])
          .filter((e) => {
            if (e.id === entity.id) {
              return false;
            } else if (isSymbol(entity) && isSymbol(e)) {
              return entity.attributes.tex === e.attributes.tex;
            } else if (isTerm(entity) && isTerm(e)) {
              return entity.attributes.name === e.attributes.name;
            }
            return false;
          })
          .map((e) => e.id)
      );
    }

    /*
     * Patch entities, saving which ones were successfully updated.
     */
    const patchedEntities = await Promise.all(
      entitiesToPatch.map((id) =>
        api.patchEntity(paperId.id, { ...updateData, id })
      )
    ).then((successes) =>
      successes
        .map((success, i) => (success ? entitiesToPatch[i] : undefined))
        .filter((id) => id !== undefined)
        .map((id) => id as string)
    );

    /*
     * Update entities in memory. Only update those that were successfully patched.
     */
    this.setState((prevState) => {
      const prevEntities = prevState.entities;
      if (prevEntities !== null) {
        let nextEntities = { ...prevEntities };
        patchedEntities.forEach((id) => {
          const prevEntity = prevEntities.byId[id];
          const updated = {
            ...prevEntity,
            attributes: { ...prevEntity.attributes, ...updateData.attributes },
            relationships: {
              ...prevEntity.relationships,
              ...updateData.relationships,
            },
          };
          nextEntities = stateUtils.update(nextEntities, id, updated);
        });
        return {
          entities: nextEntities,
        };
      }
      return { entities: prevState.entities };
    });

    const completeSuccess = entitiesToPatch.length === patchedEntities.length;
    return completeSuccess;
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
           * Deselect the entity if it's currently selected.
           */
          let selectionState;
          if (prevState.selectedEntityIds.indexOf(id) !== -1) {
            selectionState = {
              selectedEntityIds: [],
              selectedAnnotationIds: [],
              selectedAnnotationSpanIds: [],
            };
          } else {
            selectionState = {
              selectedEntityIds: prevState.selectedEntityIds,
              selectedAnnotationIds: prevState.selectedAnnotationIds,
              selectedAnnotationSpanIds: prevState.selectedAnnotationSpanIds,
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

  setMultiselectEnabled(enabled: boolean) {
    this.setState({ multiselectEnabled: enabled });
  }

  setPropagateEntityEdits(propagate: boolean) {
    this.setState({
      propagateEntityEdits: propagate,
    });
  }

  startTextSearch() {
    this.setState({
      isFindActive: true,
      findActivationTimeMs: Date.now(),
      findMode: "pdfjs-builtin-find",
    });
  }

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
        this.jumpToEntity(symbolId);
      }
      return { findMatchIndex };
    });
  }

  setFindQuery(findQuery: FindQuery) {
    this.setState((state) => {
      if (state.findMode === "symbol" && state.entities !== null) {
        const selectedSymbolIds = selectors.symbolIds(
          state.entities,
          state.selectedEntityIds
        );
        if (selectedSymbolIds.length === 0) {
          return {};
        }

        const symbolFilters = findQuery as SymbolFilters;
        const filterList =
          symbolFilters !== null
            ? Object.values(symbolFilters.byId)
            : undefined;
        const matching = matchingSymbols(
          selectedSymbolIds,
          state.entities,
          filterList
        );
        const matchCount = matching.length;
        const lastSelectedSymbolId =
          selectedSymbolIds[selectedSymbolIds.length - 1];
        const matchIndex = matching.indexOf(lastSelectedSymbolId);
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
          [uiUtils.getPageNumber(eventData.source)]: {
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

        const userData = await api.getUserLibraryInfo();
        if (userData) {
          this.setState({ userLibrary: userData.userLibrary });
          if (userData.email) {
            const remoteLogger = getRemoteLogger();
            remoteLogger.setUsername(userData.email);
          }
        }
      }
    }
  }

  jumpToEntity(id: string) {
    /*
     * In a past version, these offsets were based roughly off those in the pdf.js "find" functionality:
     * https://github.com/mozilla/pdf.js/blob/16ae7c6960c1296370c1600312f283a68e82b137/web/pdf_find_controller.js#L28-L29
     */
    const SCROLL_OFFSET_X = -200;
    const SCROLL_OFFSET_Y = +100;

    const { pdfViewerApplication, pdfViewer, pages, entities } = this.state;

    if (
      entities === null ||
      entities.byId[id] === undefined ||
      entities.byId[id].attributes.bounding_boxes.length === 0 ||
      pdfViewerApplication === null ||
      pdfViewer === null ||
      pages === null ||
      Object.values(pages).length === 0
    ) {
      return;
    }

    const dest = entities.byId[id].attributes.bounding_boxes[0];

    /*
     * Use the size of the first loaded page to map from ratio-based entity
     * dimensions and absolute positions on the page. Note that this mapping will not work
     * if pages in a PDF have different dimensions.
     */
    const page = Object.values(pages)[0];
    const { left, top } = uiUtils.convertBoxToPdfCoordinates(page.view, dest);

    /*
     * Save the current location to history so that when a user clicks the 'Back' button, it takes
     * them back to where they were before.
     */
    pdfViewerApplication.pdfHistory.pushCurrentPosition();

    /*
     * Scroll to the destination.
     */
    pdfViewer.scrollPageIntoView({
      /*
       * pdf.js page indexes are one more than the page indexes used by this application's bounding boxes.
       */
      pageNumber: dest.page + 1,
      destArray: [
        undefined,
        { name: "XYZ" },
        left + SCROLL_OFFSET_X,
        top + SCROLL_OFFSET_Y,
      ],
    });
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
              snackbarMode={this.state.snackbarMode}
              snackbarActivationTimeMs={this.state.snackbarActivationTimeMs}
              snackbarMessage={this.state.snackbarMessage}
              handleToggleControlPanelShowing={this.toggleControlPanelShowing}
              handleSetMultiselectEnabled={this.setMultiselectEnabled}
              handleStartTextSearch={this.startTextSearch}
              handleTerminateSearch={this.closeFindBar}
              handleCloseSnackbar={this.closeSnackbar}
              handleCloseDrawer={this.closeDrawer}
            />
            <PdfjsToolbar>
              <button
                onClick={this.toggleAnnotationHints}
                className="toolbarButton hiddenLargeView pdfjs-toolbar__button"
              >
                <span>
                  {this.state.annotationHintsEnabled
                    ? "Hide Underlines"
                    : "Show Underlines"}
                </span>
              </button>
            </PdfjsToolbar>
            <ViewerOverlay
              pdfViewer={this.state.pdfViewer}
              handleSetTextSelection={this.setTextSelection}
              handleClearEntitySelection={this.clearEntitySelection}
            >
              <div
                className={classNames("scholar-reader-toolbar-container", {
                  "snackbar-showing": this.state.snackbarMode === "open",
                })}
              >
                {this.state.controlPanelShowing ? (
                  <MasterControlPanel
                    className="scholar-reader-toolbar"
                    handleClose={this.closeControlPanel}
                  >
                    {CONFIGURABLE_SETTINGS.map((setting) => (
                      <Control
                        key={setting.label}
                        setting={setting}
                        value={this.state[setting.key]}
                        handleChange={this.handleChangeSetting}
                      />
                    ))}
                  </MasterControlPanel>
                ) : null}
                {this.state.isFindActive &&
                this.state.findActivationTimeMs !== null &&
                (this.state.findMode !== "symbol" ||
                  this.state.symbolSearchEnabled) ? (
                  <FindBar
                    className="scholar-reader-toolbar"
                    /*
                     * Set the key for the widget to the time that the find event was activated
                     * (i.e., when 'Ctrl+F' was typed). This regenerates the widgets whenever
                     * a new 'find' action is started, which will select and focus the text
                     * in the search widget. See why we use key to regenerate component here:
                     * https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
                     */
                    key={this.state.findActivationTimeMs}
                    matchCount={this.state.findMatchCount}
                    matchIndex={this.state.findMatchIndex}
                    mode={this.state.findMode}
                    pdfViewerApplication={this.state.pdfViewerApplication}
                    query={this.state.findQuery}
                    handleChangeMatchCount={this.setFindMatchCount}
                    handleChangeMatchIndex={this.setFindMatchIndex}
                    handleChangeQuery={this.setFindQuery}
                    handleClose={this.closeFindBar}
                  />
                ) : null}
                {this.state.entityCreationEnabled &&
                this.state.pages !== null ? (
                  <EntityCreationToolbar
                    className="scholar-reader-toolbar"
                    pages={this.state.pages}
                    entities={this.state.entities}
                    selectedEntityIds={this.state.selectedEntityIds}
                    entityType={this.state.entityCreationType}
                    selectionMethod={
                      this.state.entityCreationAreaSelectionMethod
                    }
                    handleShowSnackbarMessage={this.showSnackbarMessage}
                    handleSelectEntityType={this.setEntityCreationType}
                    handleSelectSelectionMethod={
                      this.setEntityCreationAreaSelectionMethod
                    }
                    handleCreateEntity={this.createEntity}
                    handleCreateParentSymbol={this.createParentSymbol}
                  />
                ) : null}
                {this.props.children}
              </div>
              {this.state.textSelectionMenuEnabled &&
              this.state.pages !== null ? (
                <TextSelectionMenu
                  key={this.state.textSelectionChangeMs || undefined}
                  pages={this.state.pages}
                  textSelection={this.state.textSelection}
                  handleShowSnackbarMessage={this.showSnackbarMessage}
                />
              ) : null}
              <Drawer
                paperId={this.props.paperId}
                pdfViewer={this.state.pdfViewer}
                mode={
                  this.state.entityEditingEnabled
                    ? "open"
                    : this.state.drawerMode
                }
                entities={this.state.entities}
                selectedEntityIds={this.state.selectedEntityIds}
                entityEditingEnabled={this.state.entityEditingEnabled}
                propagateEntityEdits={this.state.propagateEntityEdits}
                handleScrollSymbolIntoView={this.scrollSymbolIntoView}
                handleClose={this.closeDrawer}
                handleUpdateEntity={this.updateEntity}
                handleDeleteEntity={this.deleteEntity}
                handleSetPropagateEntityEdits={this.setPropagateEntityEdits}
              />
              {this.state.definitionPreviewEnabled &&
              this.state.pages !== null &&
              this.state.pdfDocument !== null &&
              this.state.entities !== null ? (
                <DefinitionPreview
                  pdfViewer={this.state.pdfViewer}
                  pdfDocument={this.state.pdfDocument}
                  pages={this.state.pages}
                  entities={this.state.entities}
                  selectedEntityIds={this.state.selectedEntityIds}
                />
              ) : null}
            </ViewerOverlay>
          </>
        ) : null}
        {this.state.primerPageEnabled &&
        this.state.pdfViewer !== null &&
        this.state.pages !== null ? (
          <PrimerPage
            pdfViewer={this.state.pdfViewer}
            pages={this.state.pages}
            entities={this.state.entities}
          />
        ) : null}
        {
          /* Add overlays (e.g., annotations, etc.) atop each page. */
          this.state.pages !== null && this.state.entities !== null ? (
            <>
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
                    pageView={pageModel.view}
                    papers={this.state.papers}
                    entities={this.state.entities}
                    userLibrary={this.state.userLibrary}
                    /*
                     * Prevent unnecessary renders by only passing in the subset of selected entity and
                     * annotation IDs for this page. The PageOverlay performs a deep comparison of the
                     * lists of IDs to determine whether to re-render.
                     */
                    selectedEntityIds={selectors.entityIdsInPage(
                      this.state.selectedEntityIds,
                      this.state.entities,
                      pageNumber
                    )}
                    selectedAnnotationIds={selectors.annotationsInPage(
                      this.state.selectedAnnotationIds,
                      pageNumber
                    )}
                    selectedAnnotationSpanIds={selectors.annotationSpansInPage(
                      this.state.selectedAnnotationSpanIds,
                      pageNumber
                    )}
                    findFirstMatchEntityId={
                      this.state.symbolSearchEnabled &&
                      this.state.findMatchedEntities !== null &&
                      this.state.findMatchedEntities.length > 0 &&
                      selectors.entityIdsInPage(
                        [this.state.findMatchedEntities[0]],
                        this.state.entities,
                        pageNumber
                      ).length > 0
                        ? this.state.findMatchedEntities[0]
                        : null
                    }
                    findMatchedEntityIds={
                      this.state.symbolSearchEnabled &&
                      this.state.findMatchedEntities !== null
                        ? selectors.entityIdsInPage(
                            this.state.findMatchedEntities,
                            this.state.entities,
                            pageNumber
                          )
                        : null
                    }
                    findSelectionEntityId={
                      selectors.entityIdsInPage(
                        findMatchEntityId ? [findMatchEntityId] : [],
                        this.state.entities,
                        pageNumber
                      )[0] || null
                    }
                    showAnnotations={this.state.annotationHintsEnabled}
                    searchMaskEnabled={this.state.declutterEnabled}
                    glossStyle={this.state.glossStyle}
                    glossEvaluationEnabled={this.state.glossEvaluationEnabled}
                    entityCreationEnabled={this.state.entityCreationEnabled}
                    entityCreationType={this.state.entityCreationType}
                    entityCreationAreaSelectionMethod={
                      this.state.entityCreationAreaSelectionMethod
                    }
                    equationDiagramsEnabled={this.state.equationDiagramsEnabled}
                    copySentenceOnClick={
                      this.state.sentenceTexCopyOnOptionClickEnabled
                    }
                    handleSelectEntityAnnotation={this.selectEntityAnnotation}
                    handleShowSnackbarMessage={this.showSnackbarMessage}
                    handleAddPaperToLibrary={this.addToLibrary}
                    handleCreateEntity={this.createEntity}
                    handleDeleteEntity={this.deleteEntity}
                  />
                );
              })}
            </>
          ) : null
        }
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
