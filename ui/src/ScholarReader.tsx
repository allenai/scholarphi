import classNames from "classnames";
import React from "react";
import * as api from "./api/api";
import {
  DiscourseObj,
  Entity,
  EntityCreateData,
  EntityUpdateData,
  isCitation,
  isEquation,
  isSymbol,
  isTerm,
  Paper,
  RhetoricUnit,
  Symbol,
} from "./api/types";
import Control from "./components/control/Control";
import EntityCreationCanvas from "./components/control/EntityCreationCanvas";
import EntityCreationToolbar, {
  AreaSelectionMethod,
  createCreateEntityDataWithBoxes,
} from "./components/control/EntityCreationToolbar";
import MainControlPanel from "./components/control/MainControlPanel";
import TextSelectionMenu from "./components/control/TextSelectionMenu";
import DiscourseTagLayer from "./components/discourse/DiscourseTagLayer";
import HighlightLayer from "./components/discourse/HighlightLayer";
import UnderlineLayer from "./components/discourse/UnderlineLayer";
import { Drawer, DrawerContentType } from "./components/drawer/Drawer";
import DrawerControlFab from "./components/drawer/DrawerControlFab";
import EntityAnnotationLayer from "./components/entity/EntityAnnotationLayer";
import EquationDiagram from "./components/entity/equation/EquationDiagram";
import { MinusIcon } from "./components/icon/MinusIcon";
import { PlusIcon } from "./components/icon/PlusIcon";
import EntityPageMask from "./components/mask/EntityPageMask";
import SearchPageMask from "./components/mask/SearchPageMask";
import AppOverlay from "./components/overlay/AppOverlay";
import PageOverlay from "./components/overlay/PageOverlay";
import ViewerOverlay from "./components/overlay/ViewerOverlay";
import PdfjsBrandbar from "./components/pdfjs/PdfjsBrandbar";
import PdfjsToolbar from "./components/pdfjs/PdfjsToolbar";
import DefinitionPreview from "./components/preview/DefinitionPreview";
import PrimerPage from "./components/primer/PrimerPage";
import ScrollbarMarkup from "./components/scrollbar/ScrollbarMarkup";
import FindBar, { FindQuery } from "./components/search/FindBar";
import abstractData from "./data/abstract/skimmingData.json";
import captionData from "./data/captions/skimmingData.json";
import facetData from "./data/facets/skimmingData.json";
import sentenceData from "./data/sentences/skimmingData.json";
import logger from "./logging";
import * as selectors from "./selectors";
import { matchingSymbols } from "./selectors";
import {
  ConfigurableSetting,
  CONFIGURABLE_SETTINGS,
  getSettings,
  GlossStyle,
} from "./settings";
import {
  Entities,
  KnownEntityType,
  Pages,
  PaperId,
  State,
  SymbolFilters,
} from "./state";
import "./style/index.less";
import {
  DocumentLoadedEvent,
  PageRenderedEvent,
  PDFViewerApplication,
} from "./types/pdfjs-viewer";
import * as stateUtils from "./utils/state";
import * as uiUtils from "./utils/ui";

interface Props {
  paperId?: PaperId;
  presets?: string[];
  context?: any;
}

export default class ScholarReader extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const settings = getSettings(props.presets);
    const loggingContext: any = { ...props.context };
    if (props.presets) {
      loggingContext.presets = props.presets;
    }
    if (props.paperId) {
      loggingContext.paperId = props.paperId;
    }
    logger.setContext(loggingContext);

    this.state = {
      entities: null,
      lazyPapers: new Map(),

      pages: null,
      pdfViewerApplication: null,
      pdfDocument: null,
      pdfViewer: null,

      controlPanelShowing: false,

      areCitationsLoading: false,

      selectedAnnotationIds: [],
      selectedAnnotationSpanIds: [],
      selectedEntityIds: [],
      multiselectEnabled: false,
      jumpTarget: null,

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
      drawerContentType: null,
      snackbarMode: "closed",
      snackbarActivationTimeMs: null,
      snackbarMessage: null,

      entityCreationAreaSelectionMethod: "text-selection",
      entityCreationType: "term",
      propagateEntityEdits: true,

      skimOpacity: 0.3,
      showSkimmingAnnotations: true,

      leadSentences:
        props.paperId !== undefined
          ? Object(sentenceData)[props.paperId.id]
          : [],
      currentDiscourseObjId: null,
      discourseObjs: [],
      discourseObjsById: {},
      deselectedDiscourses: [],
      hiddenDiscourseObjs: [],
      numHighlightMultiplier: {
        Method: 0.8,
        Result: 0.7,
      },

      ...settings,
    };
  }

  toggleControlPanelShowing = (): void => {
    this.setState((prevState) => ({
      controlPanelShowing: !prevState.controlPanelShowing,
    }));
  };

  toggleAnnotationHints = (): void => {
    this.setState((prevState) => ({
      annotationHintsEnabled: !prevState.annotationHintsEnabled,
    }));
  };

  toggleSkimmingAnnotations = (): void => {
    this.setState((prevState) => ({
      showSkimmingAnnotations: !prevState.showSkimmingAnnotations,
    }));
  };

  setAnnotationHintsEnabled = (enabled: boolean): void => {
    this.setState({ annotationHintsEnabled: enabled });
  };

  setGlossStyle = (style: GlossStyle): void => {
    this.setState({ glossStyle: style });
  };

  closeControlPanel = (): void => {
    this.setState({ controlPanelShowing: false });
  };

  handleChangeSetting = (setting: ConfigurableSetting, value: any): void => {
    this.setState({
      [setting.key]: value,
    } as State);
  };

  setTextSelection = (selection: Selection | null): void => {
    this.setState({
      textSelection: selection,
      textSelectionChangeMs: Date.now(),
    });
  };

  selectEntity = (id: string): void => {
    this.selectEntityAnnotation(id);
  };

  selectEntityAnnotation = (
    entityId: string,
    annotationId?: string,
    annotationSpanId?: string
  ): void => {
    logger.log("debug", "select-entity", {
      entityId,
      annotationId,
      annotationSpanId,
    });

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
      if (annotationId && selectedAnnotationIds.indexOf(annotationId) === -1) {
        selectedAnnotationIds.push(annotationId);
      }
      if (
        annotationSpanId &&
        selectedAnnotationSpanIds.indexOf(annotationSpanId) === -1
      ) {
        selectedAnnotationSpanIds.push(annotationSpanId);
      }

      logger.log("debug", "selection-updated", {
        selectedEntityIds,
        selectedAnnotationIds,
        selectedAnnotationSpanIds,
      });

      /*
       * The default behavior is to just update the selection. If the selection is a,
       * searchable type of entity, however, start a search.
       */
      const entityType = prevEntities.byId[entityId].type;
      if (["symbol", "term"].indexOf(entityType) === -1) {
        return {
          selectedEntityIds,
          selectedAnnotationIds,
          selectedAnnotationSpanIds,
          jumpTarget: null,
        } as State;
      }

      /*
       * If this is a term, start a term search.
       */
      if (entityType === "term") {
        const termIds = selectedEntityIds.filter(
          (id) => prevEntities.byId[id].type === "term"
        );
        const matching = selectors.matchingTerms(termIds, prevEntities);
        const matchCount = matching.length;
        const matchIndex = matching.indexOf(entityId);
        logger.log("debug", "starting-term-search", { matchIndex, matchCount });
        return {
          selectedEntityIds,
          selectedAnnotationIds,
          selectedAnnotationSpanIds,
          isFindActive: true,
          findMode: "term",
          findActivationTimeMs: Date.now(),
          findQuery: prevEntities.byId[entityId],
          findMatchCount: matchCount,
          findMatchIndex: matchIndex,
          findMatchedEntities: matching,
          jumpTarget: null,
        } as State;
      }

      /*
       * If this is a symbol, start a symbol search.
       */
      const symbolIds = selectedEntityIds.filter(
        (id) => prevEntities.byId[id].type === "symbol"
      );
      const matching = matchingSymbols(symbolIds, prevEntities);
      const matchCount = matching.length;
      const matchIndex = matching.indexOf(entityId);
      logger.log("debug", "starting-symbol-search", { matchIndex, matchCount });
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
        jumpTarget: null,
      } as State;
    });
  };

  clearEntitySelection = (): void => {
    logger.log("debug", "clear-entity-selection");

    /*
     * If interaction with entities is currently turned off, then nothing was selected in the
     * first place. Don't change the state, incase the selected annotation list or the jump
     * target contains important highlights that shouldn't be dismissed.
     */
    if (!this.state.annotationInteractionEnabled) {
      return;
    }

    if (this.state.findMode === "symbol" || this.state.findMode === "term") {
      this.closeFindBar();
    }
    this.setState({
      selectedAnnotationIds: [],
      selectedAnnotationSpanIds: [],
      selectedEntityIds: [],
      jumpTarget: null,
    });
  };

  setEntityCreationType = (type: KnownEntityType): void => {
    this.setState({ entityCreationType: type });
  };

  setEntityCreationAreaSelectionMethod = (
    method: AreaSelectionMethod
  ): void => {
    this.setState({ entityCreationAreaSelectionMethod: method });
  };

  createEntity = async (data: EntityCreateData): Promise<string | null> => {
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
  };

  createParentSymbol = async (childSymbols: Symbol[]): Promise<boolean> => {
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
  };

  updateEntity = async (
    entity: Entity,
    updateData: EntityUpdateData,
    propagateEdits?: boolean
  ): Promise<boolean> => {
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
  };

  deleteEntity = async (id: string): Promise<boolean> => {
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
  };

  showSnackbarMessage = (message: string): void => {
    this.setState({
      snackbarMode: "open",
      snackbarActivationTimeMs: Date.now(),
      snackbarMessage: message,
    });
  };

  closeSnackbar = (): void => {
    this.setState({
      snackbarMode: "closed",
      snackbarActivationTimeMs: null,
      snackbarMessage: null,
    });
  };

  openDrawer = (drawerContentType: DrawerContentType): void => {
    logger.log("debug", "request-open-drawer", { drawerContentType });
    this.setState({
      drawerMode: "open",
      drawerContentType,
    });
  };

  openDrawerWithFacets = () => {
    this.openDrawer("facets");
  };

  closeDrawer = (): void => {
    logger.log("debug", "close-drawer");
    this.setState({ drawerMode: "closed" });
  };

  toggleDrawer = (drawerContentType: DrawerContentType): void => {
    if (this.state.drawerMode === "closed") {
      this.openDrawer(drawerContentType);
    } else {
      this.closeDrawer();
    }
  };

  setMultiselectEnabled = (enabled: boolean): void => {
    this.setState({ multiselectEnabled: enabled });
  };

  setPropagateEntityEdits = (propagate: boolean): void => {
    this.setState({
      propagateEntityEdits: propagate,
    });
  };

  startTextSearch = (): void => {
    logger.log("debug", "start-text-search");
    this.setState({
      isFindActive: true,
      findActivationTimeMs: Date.now(),
      findMode: "pdfjs-builtin-find",
    });
  };

  setFindMatchCount = (findMatchCount: number | null): void => {
    logger.log("debug", "find-match-count-updated", { count: findMatchCount });
    this.setState({ findMatchCount });
  };

  setFindMatchIndex = (findMatchIndex: number | null): void => {
    logger.log("debug", "find-match-index-updated", {
      index: findMatchIndex,
      count: this.state.findMatchCount,
    });
    this.setState((state) => {
      if (
        (state.findMode === "symbol" || state.findMode === "term") &&
        state.findMatchedEntities !== null &&
        findMatchIndex !== null &&
        state.entities !== null
      ) {
        const entityId = state.findMatchedEntities[findMatchIndex];
        this.jumpToEntity(entityId);
      }
      return { findMatchIndex };
    });
  };

  setFindQuery = (findQuery: FindQuery): void => {
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
  };

  closeFindBar = (): void => {
    logger.log("debug", "find-close");
    this.setState({
      isFindActive: false,
      findActivationTimeMs: null,
      findMode: null,
      findQuery: null,
      findMatchCount: null,
      findMatchIndex: null,
      findMatchedEntities: null,
    });
  };

  componentDidMount() {
    waitForPDFViewerInitialization().then((application) => {
      logger.log("debug", "application-loaded");
      /*
       * Tell pdf.js not to use default find functionality, but instead to forward find events
       * to external services. The events are intercepted in 'FindBar'.
       */
      application.externalServices.supportsIntegratedFind = true;

      this.setState({ pdfViewerApplication: application });
      this.subscribeToPDFViewerStateChanges(application);
    });
    this.loadDataFromApi();

    document.addEventListener("keydown", (event) => {
      if (uiUtils.isKeypressShiftTab(event)) {
        event.preventDefault();
        if (this.state.discourseObjs.length > 0) {
          this.moveToPreviousDiscourseObj();
        }
      } else if (uiUtils.isKeypressTab(event)) {
        event.preventDefault();
        if (this.state.discourseObjs.length > 0) {
          this.moveToNextDiscourseObj();
        }
      }
    });

    if (this.props.paperId !== undefined) {
      this.initDiscourseObjs();
    }
  }

  moveToNextDiscourseObj = () => {
    const activeDiscourseObjs = this.filterDiscourseObjsToShow(
      this.state.discourseObjs
    );
    const discourseIds = activeDiscourseObjs.map((x) => x.id);
    const numDiscourseObjs = activeDiscourseObjs.length;
    let nextId = "";
    if (this.state.currentDiscourseObjId !== null) {
      const currIdx = discourseIds.indexOf(this.state.currentDiscourseObjId);
      const nextIdx = (currIdx + 1) % numDiscourseObjs;
      nextId = discourseIds[nextIdx];
    } else {
      nextId = discourseIds[0];
    }
    uiUtils.removeClassFromElementsByClassname("selected");
    uiUtils.addClassToElementsByClassname(`highlight-${nextId}`, "selected");
    this.jumpToDiscourseObj(nextId);
  };

  moveToPreviousDiscourseObj = () => {
    const activeDiscourseObjs = this.filterDiscourseObjsToShow(
      this.state.discourseObjs
    );
    const discourseIds = activeDiscourseObjs.map((x) => x.id);
    const numDiscourseObjs = activeDiscourseObjs.length;
    let nextId = "";
    if (this.state.currentDiscourseObjId !== null) {
      const currIdx = discourseIds.indexOf(this.state.currentDiscourseObjId);
      const nextIdx = (numDiscourseObjs + currIdx - 1) % numDiscourseObjs;
      nextId = discourseIds[nextIdx];
    } else {
      nextId = discourseIds[numDiscourseObjs - 1];
    }
    uiUtils.removeClassFromElementsByClassname("selected");
    uiUtils.addClassToElementsByClassname(`highlight-${nextId}`, "selected");
    this.jumpToDiscourseObj(nextId);
  };

  setCurrentDiscourseObjId = (d: DiscourseObj) => {
    this.setState({
      currentDiscourseObjId: d.id,
    });
  };

  initDiscourseObjs = () => {
    const unitsToShow: RhetoricUnit[] = [];

    unitsToShow.push(...this.getAbstractHighlights());

    let data = Object(facetData)[this.props.paperId!.id];
    data = this.preprocessData(data);
    unitsToShow.push(...this.getNoveltyHighlights(data));
    unitsToShow.push(...this.getObjectiveHighlights(data));
    unitsToShow.push(...this.getMethodHighlights(data));
    unitsToShow.push(...this.getResultHighlights(data));
    // unitsToShow.push(...this.getConclusionHighlights(data));
    unitsToShow.push(...this.getAuthorStatements(data));

    let discourseObjs = this.makeDiscourseObjsFromRhetoricUnits(unitsToShow);
    discourseObjs = this.disambiguateDiscourseLabels(discourseObjs);
    this.setState({
      discourseObjs: uiUtils.sortDiscourseObjs(discourseObjs),
      discourseObjsById: this.makeDiscourseByIdMap(discourseObjs),
    });
  };

  filterDiscourseObjsToShow = (discourseObjs: DiscourseObj[]) => {
    if (!this.state.facetHighlights) {
      discourseObjs = discourseObjs.filter(
        (x: DiscourseObj) => x.label === "Author"
      );
    }
    if (!this.state.authorStatementsEnabled) {
      discourseObjs = discourseObjs.filter(
        (x: DiscourseObj) => x.label !== "Author"
      );
    }
    discourseObjs = discourseObjs.filter(
      (x: DiscourseObj) => !this.state.deselectedDiscourses.includes(x.label)
    );
    discourseObjs = discourseObjs.filter((x: DiscourseObj) => {
      const hiddenIds = this.state.hiddenDiscourseObjs.map((d) => d.id);
      return !hiddenIds.includes(x.id);
    });
    return discourseObjs;
  };

  makeDiscourseByIdMap = (discourseObjs: DiscourseObj[]) => {
    const discourseObjsById = discourseObjs.reduce(
      (acc: { [id: string]: DiscourseObj }, d: DiscourseObj) => {
        acc[d.id] = d;
        return acc;
      },
      {}
    );
    return discourseObjsById;
  };

  makeDiscourseObjsFromRhetoricUnits = (
    units: RhetoricUnit[]
  ): DiscourseObj[] => {
    const discourseToColorMap: {
      [label: string]: string;
    } = uiUtils.getDiscourseToColorMap();

    return units.map((r: RhetoricUnit) => ({
      id: r.id,
      entity: r,
      label: r.label,
      bboxes: r.bboxes,
      tagLocation: r.bboxes[0],
      color: discourseToColorMap[r.label] ?? discourseToColorMap["Highlight"],
    }));
  };

  getAbstractHighlights = () => {
    let selectedAbstractHighlights: RhetoricUnit[] = [];

    let abstractHighlights = Object(abstractData)[this.props.paperId!.id];

    const labels = ["Objective", "Method", "Result"];
    labels.forEach((label) => {
      const sortedLabelObjs = abstractHighlights
        .filter((r: RhetoricUnit) => r.label === label && r.prob !== null)
        .sort((r1: RhetoricUnit, r2: RhetoricUnit) =>
          r1.prob! > r2.prob! ? -1 : 1
        );
      selectedAbstractHighlights.push(...sortedLabelObjs.slice(0, 2));
    });

    return selectedAbstractHighlights;
  };

  getNoveltyHighlights = (data: RhetoricUnit[]) => {
    return data.filter(
      (r) =>
        r.label === "Novelty" &&
        r.is_in_expected_section &&
        r.is_author_statement
    );
  };

  getMethodHighlights = (data: RhetoricUnit[]) => {
    const method = data.filter(
      (r) => r.label === "Method" && r.is_in_expected_section
    );
    const heuristicPreds = method.filter((r) => r.prob === null);
    const classifierPreds = method
      .filter((r) => r.prob !== null)
      .sort((r1, r2) => (r1.prob! > r2.prob! ? -1 : 1));
    const combined = [...classifierPreds, ...heuristicPreds];
    return combined.slice(
      0,
      Math.round(this.state.numHighlightMultiplier["Method"] * combined.length)
    );
  };

  getResultHighlights = (data: RhetoricUnit[]) => {
    const result = data.filter((r) => {
      const hasCitation = new RegExp(/\[.*\d.*\]/).test(r.text);
      return r.label === "Result" && r.is_in_expected_section && !hasCitation;
    });
    const heuristicPreds = result.filter((r) => r.prob === null);
    const classifierPreds = result
      .filter((r: RhetoricUnit) => r.prob !== null)
      .sort((r1, r2) => (r1.prob! > r2.prob! ? -1 : 1));

    const combined = [...heuristicPreds, ...classifierPreds];
    return combined.slice(
      0,
      Math.round(this.state.numHighlightMultiplier["Result"] * combined.length)
    );
  };

  getObjectiveHighlights = (data: RhetoricUnit[]) => {
    return data.filter(
      (r) =>
        r.label === "Objective" &&
        r.is_author_statement &&
        r.is_in_expected_section
    );
  };

  getConclusionHighlights = (data: RhetoricUnit[]) => {
    return data.filter(
      (r) =>
        r.label === "Conclusion" &&
        r.is_author_statement &&
        r.is_in_expected_section
    );
  };

  getAuthorStatements = (data: RhetoricUnit[]) => {
    return data.filter((r) => r.label === "Author");
  };

  preprocessData = (data: RhetoricUnit[]) => {
    // Remove sentence fragments that were detected (i.e., start with a lowercase letter).
    // Exception: author statements
    return data.filter(
      (r: RhetoricUnit) =>
        r.label === "Author" || r.text[0] !== r.text[0].toLowerCase()
    );
  };

  disambiguateDiscourseLabels = (discourseObjs: DiscourseObj[]) => {
    // Because heuristics and the classifier may assign multiple labels to a single sentence,
    // we enforce a label prioritization scheme to ensure each sentence gets a unique label.
    const text_to_labels: { [text: string]: DiscourseObj[] } = {};
    discourseObjs.forEach((d) => {
      if (!text_to_labels.hasOwnProperty(d.entity.text)) {
        text_to_labels[d.entity.text] = [];
      }
      text_to_labels[d.entity.text].push(d);
    });
    return Object.values(text_to_labels)
      .map((labels) => {
        const sortedLabels = labels.sort((firstEl, _) => {
          if (firstEl.label === "Contribution") {
            return -1;
          } else if (firstEl.label === "Result") {
            return -1;
          } else if (firstEl.label === "Novelty") {
            return -1;
          } else {
            return 0;
          }
        });
        return sortedLabels;
      })
      .map(
        (objsWithMultipleLabels: DiscourseObj[]) => objsWithMultipleLabels[0]
      );
  };

  selectDiscourseClass = (discourse: string) => {
    this.setState((prevState) => {
      if (prevState.deselectedDiscourses.includes(discourse)) {
        if (prevState.numHighlightMultiplier[discourse] === 0) {
          return prevState;
        }
        const tagRemoved = prevState.deselectedDiscourses.filter(
          (d) => d !== discourse
        );
        return { ...prevState, deselectedDiscourses: tagRemoved };
      } else {
        return {
          ...prevState,
          deselectedDiscourses: [...prevState.deselectedDiscourses, discourse],
        };
      }
    });
  };

  filterToDiscourse = (discourse: string) => {
    if (
      this.state.deselectedDiscourses.length === 1 &&
      this.state.deselectedDiscourses[0] === discourse
    ) {
      return;
    }

    const availableDiscourseClasses = [
      ...new Set(this.state.discourseObjs.map((d) => d.label)),
    ];
    const deselectedDiscourses = availableDiscourseClasses.filter(
      (d) => d !== discourse
    );
    this.setState({
      deselectedDiscourses: deselectedDiscourses,
    });
  };

  increaseNumHighlights = (discourses: string[]) => {
    this.setState((prevState) => {
      let newHighlightMultiplier = prevState.numHighlightMultiplier;
      discourses.forEach((discourse: string) => {
        const prevMultiplier = prevState.numHighlightMultiplier[discourse];
        const increment = 0.1;
        const highlightMult = Math.min(
          1,
          Math.round((prevMultiplier + increment) * 10) / 10
        );
        newHighlightMultiplier = {
          ...newHighlightMultiplier,
          [discourse]: highlightMult,
        };
      });

      let newDeselectedDiscourses = prevState.deselectedDiscourses;
      discourses.forEach((discourse: string) => {
        if (prevState.numHighlightMultiplier[discourse] === 0) {
          newDeselectedDiscourses = newDeselectedDiscourses.filter(
            (d) => d !== discourse
          );
        }
      });
      return {
        numHighlightMultiplier: newHighlightMultiplier,
        deselectedDiscourses: newDeselectedDiscourses,
      };
    }, this.initDiscourseObjs);
  };

  decreaseNumHighlights = (discourses: string[]) => {
    this.setState((prevState) => {
      let newHighlightMultiplier = prevState.numHighlightMultiplier;
      discourses.forEach((discourse: string) => {
        const prevMultiplier = prevState.numHighlightMultiplier[discourse];
        const decrement = 0.1;
        const highlightMult = Math.max(
          0,
          Math.round((prevMultiplier - decrement) * 10) / 10
        );
        newHighlightMultiplier = {
          ...newHighlightMultiplier,
          [discourse]: highlightMult,
        };
      });

      let newDeselectedDiscourses = prevState.deselectedDiscourses;
      discourses.forEach((discourse: string) => {
        if (newHighlightMultiplier[discourse] === 0) {
          newDeselectedDiscourses.push(discourse);
        }
      });
      return {
        numHighlightMultiplier: newHighlightMultiplier,
        deselectedDiscourses: newDeselectedDiscourses,
      };
    }, this.initDiscourseObjs);
  };

  onScrollbarMarkClicked = (id: string) => {
    this.jumpToDiscourseObj(id);
  };

  hideDiscourseObj = (d: DiscourseObj) => {
    this.setState((prevState) => ({
      hiddenDiscourseObjs: [...prevState.hiddenDiscourseObjs, d],
    }));
  };

  subscribeToPDFViewerStateChanges = (
    pdfViewerApplication: PDFViewerApplication
  ): void => {
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
  };

  loadDataFromApi = async (): Promise<void> => {
    if (
      this.props.paperId !== undefined &&
      this.props.paperId.type === "arxiv"
    ) {
      const loadingStartTime = performance.now();
      const entities = await api.getDedupedEntities(
        this.props.paperId.id,
        true
      );
      this.setState({
        entities: stateUtils.createRelationalStoreFromArray(entities, "id"),
      });

      const citationS2Ids = entities
        .filter(isCitation)
        .map((c) => c.attributes.paper_id)
        .filter((id) => id !== null)
        .map((id) => id as string);

      if (window.heap) {
        const loadingTimeMS = Math.round(performance.now() - loadingStartTime);
        window.heap.track("paper-loaded", {
          loadingTimeMS,
          numEntities: entities.length,
          numCitations: citationS2Ids.length,
        });
      }
    }
  };

  cachePaper = (paper: Paper, cb?: () => void): void => {
    const paperMap = new Map(this.state.lazyPapers);
    paperMap.set(paper.s2Id, paper);
    this.setState(
      {
        lazyPapers: paperMap,
      },
      cb
    );
  };

  jumpToEntityWithBackMessage = (id: string): void => {
    const success = this.jumpToEntity(id);

    if (success && !this._backButtonHintShown) {
      this.showSnackbarMessage(
        "Resume where you left by pressing the browser '←' button."
      );
      // this._backButtonHintShown = true;
    }
  };

  jumpToEntity = (id: string): boolean => {
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
      return false;
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
     * Scroll to the destination. Use the 'navigateTo', which will save
     * the current location to history so that when a user clicks the 'Back' button, it takes
     * them back to where they were before.
     */
    pdfViewerApplication.pdfLinkService.navigateTo([
      dest.page,
      { name: "XYZ" },
      left + SCROLL_OFFSET_X,
      top + SCROLL_OFFSET_Y,
    ]);

    /*
     * Store the position that the paper has jumped to.
     */
    this.setState({
      jumpTarget: id,
    });

    return true;
  };

  jumpToDiscourseObj = (id: string) => {
    const SCROLL_OFFSET_X = -200;
    const SCROLL_OFFSET_Y = +100;

    const {
      pdfViewerApplication,
      pdfViewer,
      pages,
      discourseObjsById,
    } = this.state;

    if (
      pdfViewerApplication === null ||
      pdfViewer === null ||
      pages === null ||
      Object.values(pages).length === 0
    ) {
      return false;
    }

    const dest = discourseObjsById[id].bboxes[0];
    const page = Object.values(pages)[0];
    const { left, top } = uiUtils.convertBoxToPdfCoordinates(page.view, dest);

    /*
     * Scroll to the destination. Use the 'navigateTo', which will save
     * the current location to history so that when a user clicks the 'Back' button, it takes
     * them back to where they were before.
     */
    pdfViewerApplication.pdfLinkService.navigateTo([
      dest.page,
      { name: "XYZ" },
      left + SCROLL_OFFSET_X,
      top + SCROLL_OFFSET_Y,
    ]);

    /*
     * Store the position that the paper has jumped to.
     */
    this.setState({
      jumpTarget: id,
      currentDiscourseObjId: id,
    });

    return true;
  };

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

    if (
      !this._jumpedToInitialFocus &&
      this.state.pages !== null &&
      Object.keys(this.state.pages).length > 0 &&
      this.state.entities !== null
    ) {
      if (this.state.initialFocus !== null) {
        this.jumpToEntity(this.state.initialFocus);
        logger.log("debug", "jump-page-to-initial-focus", {
          entityId: this.state.initialFocus,
        });
      }
      this._jumpedToInitialFocus = true;
    }

    const leadSentences = this.state.leadSentencesEnabled
      ? this.state.leadSentences
      : null;

    let discourseObjs = this.filterDiscourseObjsToShow(
      this.state.discourseObjs
    );

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
              {this.state.showSkimmingAnnotations &&
                this.state.facetHighlights && (
                  <>
                    <label
                      htmlFor="moreHighlightsButton"
                      className="toolbarLabel pdfjs-toolbar__label"
                    >
                      Number of highlights
                    </label>
                    <button
                      onClick={() => {
                        this.decreaseNumHighlights(["Result", "Method"]);
                      }}
                      className="toolbarButton hiddenLargeView pdfjs-toolbar__button"
                    >
                      <MinusIcon width="16" height="16" />
                    </button>
                    <button
                      id="moreHighlightsButton"
                      onClick={() => {
                        this.increaseNumHighlights(["Result", "Method"]);
                      }}
                      className="toolbarButton hiddenLargeView pdfjs-toolbar__button"
                    >
                      <PlusIcon width="16" height="16" />
                    </button>
                  </>
                )}
              <button
                onClick={this.toggleSkimmingAnnotations}
                className="toolbarButton hiddenLargeView pdfjs-toolbar__button"
              >
                <span>
                  {this.state.showSkimmingAnnotations
                    ? "Deactivate skimming"
                    : "Activate skimming"}
                </span>
              </button>
              {/* <button
                onClick={this.toggleControlPanelShowing}
                className="toolbarButton hiddenLargeView pdfjs-toolbar__button"
              >
                <span>Customize UI</span>
              </button> */}
            </PdfjsToolbar>
            <PdfjsBrandbar />
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
                  <MainControlPanel
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
                  </MainControlPanel>
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
                pdfViewer={this.state.pdfViewer}
                mode={
                  this.state.drawerMode === "open" ||
                  this.state.entityEditingEnabled
                    ? "open"
                    : "closed"
                }
                contentType={
                  this.state.entityEditingEnabled
                    ? "entity-property-editor"
                    : this.state.drawerContentType
                }
                entities={this.state.entities}
                selectedEntityIds={this.state.selectedEntityIds}
                discourseObjs={discourseObjs}
                deselectedDiscourses={this.state.deselectedDiscourses}
                handleDiscourseSelected={this.selectDiscourseClass}
                handleJumpToDiscourseObj={this.jumpToDiscourseObj}
                propagateEntityEdits={this.state.propagateEntityEdits}
                handleJumpToEntity={this.jumpToEntityWithBackMessage}
                handleClose={this.closeDrawer}
                handleUpdateEntity={this.updateEntity}
                handleDeleteEntity={this.deleteEntity}
                handleSetPropagateEntityEdits={this.setPropagateEntityEdits}
              />
              {this.state.showSkimmingAnnotations &&
                this.state.facetDrawerEnabled && (
                  <DrawerControlFab
                    drawerMode={this.state.drawerMode}
                    handleOpenDrawer={this.openDrawerWithFacets}
                    handleCloseDrawer={this.closeDrawer}
                  />
                )}
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
              {this.state.pdfViewerApplication &&
                this.state.pages !== null &&
                this.state.showSkimmingAnnotations &&
                this.state.facetHighlights &&
                discourseObjs.length > 0 && (
                  <ScrollbarMarkup
                    numPages={
                      this.state.pdfViewerApplication?.pdfDocument?.numPages
                    }
                    discourseObjs={discourseObjs}
                    captionUnits={
                      this.state.mediaScrollbarMarkupEnabled
                        ? Object(captionData)[this.props.paperId!.id]
                        : []
                    }
                    handleMarkClicked={this.onScrollbarMarkClicked}
                  ></ScrollbarMarkup>
                )}
            </ViewerOverlay>
          </>
        ) : null}
        {this.state.primerPageEnabled &&
        this.state.pdfViewer !== null &&
        this.state.pages !== null ? (
          <PrimerPage
            paperId={this.props.paperId}
            pdfViewer={this.state.pdfViewer}
            pages={this.state.pages}
            entities={this.state.entities}
            annotationHintsEnabled={this.state.annotationHintsEnabled}
            primerPageGlossaryEnabled={this.state.primerPageGlossaryEnabled}
            termGlossesEnabled={this.state.termGlossesEnabled}
            showInstructions={this.state.primerInstructionsEnabled}
            scrollToPageOnLoad={this.state.initialFocus === null}
            handleSetAnnotationHintsEnabled={this.setAnnotationHintsEnabled}
            areCitationsLoading={this.state.areCitationsLoading}
          />
        ) : null}
        {
          /* Add overlays (e.g., annotations, etc.) atop each page. */
          this.state.pages !== null && this.state.entities !== null ? (
            <>
              {Object.keys(this.state.pages).map((pageNumberKey) => {
                const pages = this.state.pages as Pages;
                const entities = this.state.entities as Entities;

                const pageNumber = Number(pageNumberKey);
                const pageModel = pages[pageNumber];
                const pageView = pageModel.view;

                /*
                 * By setting the key to the page number *and* the timestamp it was rendered, React will
                 * know to replace a page overlay when a pdf.js re-renders a page.
                 */
                const key = `${pageNumber}-${pageModel.timeOfLastRender}`;

                /*
                 * Prevent unnecessary renders by only passing in the subset of selected entity and
                 * annotation IDs for this page. The PageOverlay performs a deep comparison of the
                 * lists of IDs to determine whether to re-render.
                 */
                const selectedEntityIds = selectors.entityIdsInPage(
                  this.state.selectedEntityIds,
                  this.state.entities,
                  pageNumber
                );
                const selectedAnnotationIds = selectors.annotationsInPage(
                  this.state.selectedAnnotationIds,
                  pageNumber
                );
                const selectedAnnotationSpanIds = selectors.annotationSpansInPage(
                  this.state.selectedAnnotationSpanIds,
                  pageNumber
                );
                const findFirstMatchEntityId =
                  this.state.symbolSearchEnabled &&
                  this.state.findMatchedEntities !== null &&
                  this.state.findMatchedEntities.length > 0 &&
                  selectors.entityIdsInPage(
                    [this.state.findMatchedEntities[0]],
                    entities,
                    pageNumber
                  ).length > 0
                    ? this.state.findMatchedEntities[0]
                    : null;
                const findMatchedEntityIds =
                  this.state.symbolSearchEnabled &&
                  this.state.isFindActive &&
                  this.state.findMatchedEntities !== null
                    ? selectors.entityIdsInPage(
                        this.state.findMatchedEntities,
                        entities,
                        pageNumber
                      )
                    : null;
                const findSelectionEntityId =
                  selectors.entityIdsInPage(
                    findMatchEntityId ? [findMatchEntityId] : [],
                    entities,
                    pageNumber
                  )[0] || null;
                const jumpTarget =
                  selectors.entityIdsInPage(
                    this.state.jumpTarget ? [this.state.jumpTarget] : [],
                    entities,
                    pageNumber
                  )[0] || null;

                return (
                  <PageOverlay key={key} pageView={pageView}>
                    {/* Mask for highlighting results from in-situ search. */}
                    {!this.state.entityCreationEnabled &&
                    this.state.declutterEnabled &&
                    (this.state.findMode === "symbol" ||
                      this.state.findMode === "term") &&
                    findMatchedEntityIds !== null ? (
                      <SearchPageMask
                        pageView={pageView}
                        entities={entities}
                        firstMatchingEntityId={findFirstMatchEntityId}
                        matchingEntityIds={findMatchedEntityIds}
                        highlightFirstMatch={false}
                      />
                    ) : null}
                    {/* Mask for highlighting selected entities. */}
                    {!this.state.entityCreationEnabled &&
                    this.state.equationDiagramsEnabled &&
                    selectedEntityIds
                      .map((id) => entities.byId[id])
                      .filter((e) => e !== undefined)
                      .some(isEquation) ? (
                      <EntityPageMask
                        pageView={pageView}
                        entities={entities}
                        selectedEntityIds={selectedEntityIds}
                      />
                    ) : null}
                    {/* Interactive annotations on entities. */}
                    {this.state.entities !== null && (
                      <EntityAnnotationLayer
                        paperId={this.props.paperId}
                        pageView={pageView}
                        entities={entities}
                        lazyPapers={this.state.lazyPapers}
                        cachePaper={this.cachePaper}
                        selectedEntityIds={selectedEntityIds}
                        selectedAnnotationIds={selectedAnnotationIds}
                        selectedAnnotationSpanIds={selectedAnnotationSpanIds}
                        findMatchedEntityIds={findMatchedEntityIds}
                        findSelectionEntityId={findSelectionEntityId}
                        jumpTarget={jumpTarget}
                        showAnnotations={this.state.annotationHintsEnabled}
                        annotationInteractionEnabled={
                          this.state.annotationInteractionEnabled
                        }
                        showGlosses={this.state.glossesEnabled}
                        citationAnnotationsEnabled={
                          this.state.citationGlossesEnabled
                        }
                        termAnnotationsEnabled={this.state.termGlossesEnabled}
                        symbolUnderlineMethod={this.state.symbolUnderlineMethod}
                        definitionsInSymbolGloss={
                          this.state.definitionsInSymbolGloss
                        }
                        glossStyle={this.state.glossStyle}
                        glossEvaluationEnabled={
                          this.state.glossEvaluationEnabled
                        }
                        equationDiagramsEnabled={
                          this.state.equationDiagramsEnabled
                        }
                        copySentenceOnClick={
                          this.state.sentenceTexCopyOnOptionClickEnabled
                        }
                        handleSelectEntityAnnotation={
                          this.selectEntityAnnotation
                        }
                        handleShowSnackbarMessage={this.showSnackbarMessage}
                        handleJumpToEntity={this.jumpToEntityWithBackMessage}
                        handleOpenDrawer={this.openDrawer}
                      />
                    )}
                    {/* Equation diagram overlays. */}
                    {this.state.equationDiagramsEnabled &&
                      selectedEntityIds
                        .map((id) => entities.byId[id])
                        .filter((e) => e !== undefined)
                        .filter(isEquation)
                        .map((e) => (
                          <EquationDiagram
                            key={`${e.id}-${this.state.useDefinitionsForDiagramLabels}`}
                            pageView={pageView}
                            entities={entities}
                            equation={e}
                            labelSource={
                              this.state.useDefinitionsForDiagramLabels
                                ? "any-definition"
                                : "only-diagram-labels"
                            }
                            handleShowMore={this.selectEntity}
                          />
                        ))}
                    {/* Canvas for annotating entities. */}
                    {this.state.entityCreationEnabled &&
                      this.state.entityCreationAreaSelectionMethod ===
                        "rectangular-selection" && (
                        <EntityCreationCanvas
                          pageView={pageView}
                          pageNumber={pageNumber}
                          entityType={this.state.entityCreationType}
                          handleShowSnackbarMessage={this.showSnackbarMessage}
                          handleCreateEntity={this.createEntity}
                        />
                      )}

                    {this.props.paperId !== undefined &&
                      this.state.showSkimmingAnnotations &&
                      this.state.facetTextEnabled &&
                      discourseObjs.length > 0 && (
                        <DiscourseTagLayer
                          pageView={pageView}
                          discourseObjs={discourseObjs.filter(
                            (x) => x.label !== "Author"
                          )}
                        ></DiscourseTagLayer>
                      )}

                    {this.props.paperId !== undefined &&
                      this.state.showSkimmingAnnotations &&
                      (discourseObjs.length > 0 ||
                        (leadSentences !== null && leadSentences.length > 0)) &&
                      this.state.cueingStyle === "highlight" && (
                        <HighlightLayer
                          pageView={pageView}
                          discourseObjs={discourseObjs}
                          leadSentences={leadSentences}
                          opacity={this.state.skimOpacity}
                          handleDiscourseObjSelected={
                            this.setCurrentDiscourseObjId
                          }
                          handleHideDiscourseObj={this.hideDiscourseObj}
                          handleOpenDrawer={this.openDrawerWithFacets}
                          handleCloseDrawer={this.closeDrawer}
                          drawerOpen={this.state.drawerMode === "open"}
                          handleFilterToDiscourse={this.filterToDiscourse}
                        ></HighlightLayer>
                      )}

                    {this.props.paperId !== undefined &&
                      this.state.showSkimmingAnnotations &&
                      (discourseObjs.length > 0 ||
                        (leadSentences !== null && leadSentences.length > 0)) &&
                      this.state.cueingStyle === "underline" && (
                        <UnderlineLayer
                          pageView={pageView}
                          discourseObjs={discourseObjs}
                          leadSentences={leadSentences}
                        ></UnderlineLayer>
                      )}
                  </PageOverlay>
                );
              })}
            </>
          ) : null
        }
      </>
    );
  }

  private _backButtonHintShown: boolean = false;
  private _jumpedToInitialFocus: boolean = false;
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
