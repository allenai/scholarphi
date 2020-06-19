import React from "react";
import { createPortal } from "react-dom";
import * as api from "./api";
import AppOverlay from "./AppOverlay";
import Drawer, { DrawerMode } from "./Drawer";
import FeedbackButton from "./FeedbackButton";
import FindBar, { FindQuery } from "./FindBar";
import PageOverlay from "./PageOverlay";
import * as selectors from "./selectors";
import { matchingSymbols } from "./selectors";
import {
  createRelationalStoreFromArray,
  Pages,
  PaperId,
  SelectableEntityType,
  State,
  SymbolFilters,
} from "./state";
import "./style/index.less";
import {
  Annotation,
  AnnotationData,
  BoundingBox,
  Paper,
  UserAnnotationType,
} from "./types/api";
import {
  DocumentLoadedEvent,
  PageRenderedEvent,
  PDFViewerApplication,
} from "./types/pdfjs-viewer";
import { UserAnnotationTypeSelect } from "./UserAnnotationTypeSelect";
import ViewerOverlay from "./ViewerOverlay";

interface Props {
  paperId?: PaperId;
}

class ScholarReader extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      citations: null,
      symbols: null,
      mathMls: null,
      sentences: null,
      papers: null,

      userLibrary: null,

      pages: null,
      pdfViewerApplication: null,
      pdfDocument: null,
      pdfViewer: null,

      annotationsShowing: true,
      selectedAnnotationId: null,
      selectedAnnotationSpanId: null,
      selectedEntityType: null,
      selectedEntityId: null,

      isFindActive: false,
      findMode: null,
      findActivationTimeMs: null,
      findQuery: null,
      findMatchIndex: null,
      findMatchCount: null,
      findMatchedEntities: null,
      drawerMode: "closed",

      userAnnotationsEnabled: false,
      userAnnotationType: "citation",
      userAnnotations: [],
    };

    /**
     * Bind state-changing handlers so that they will be called with 'this' as its context.
     * See https://reactjs.org/docs/faq-functions.html#how-do-i-bind-a-function-to-a-component-instance
     */
    this.setSelectedEntity = this.setSelectedEntity.bind(this);
    this.setSelectedAnnotationId = this.setSelectedAnnotationId.bind(this);
    this.setSelectedAnnotationSpanId = this.setSelectedAnnotationSpanId.bind(
      this
    );
    this.deselectSelection = this.deselectSelection.bind(this);
    this.addToLibrary = this.addToLibrary.bind(this);
    this.addUserAnnotation = this.addUserAnnotation.bind(this);
    this.updateUserAnnotation = this.updateUserAnnotation.bind(this);
    this.deleteUserAnnotation = this.deleteUserAnnotation.bind(this);
    this.scrollSymbolIntoView = this.scrollSymbolIntoView.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.selectSymbol = this.selectSymbol.bind(this);
    this.setUserAnnotationType = this.setUserAnnotationType.bind(this);
    this.setFindMatchCount = this.setFindMatchCount.bind(this);
    this.setFindMatchIndex = this.setFindMatchIndex.bind(this);
    this.setFindQuery = this.setFindQuery.bind(this);
    this.closeFindBar = this.closeFindBar.bind(this);
    this.toggleUserAnnotationMode = this.toggleUserAnnotationMode.bind(this);
    this.startTextSearch = this.startTextSearch.bind(this);
    this.startSymbolSearch = this.startSymbolSearch.bind(this);
    this.hideAnnotations = this.hideAnnotations.bind(this);
    this.showAnnotations = this.showAnnotations.bind(this);
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

  setSelectedAnnotationId(id: string | null) {
    this.setState({ selectedAnnotationId: id });
  }

  setSelectedAnnotationSpanId(id: string | null) {
    this.setState({ selectedAnnotationSpanId: id });
  }

  setSelectedEntity(type: SelectableEntityType, id: string | null) {
    this.setState({ selectedEntityId: id, selectedEntityType: type });
  }

  selectSymbol(id: string) {
    this.setSelectedEntity("symbol", id);
  }

  deselectSelection() {
    if (
      this.state.findMode === "symbol" &&
      this.state.selectedEntityType === "symbol"
    ) {
      this.closeFindBar();
    }
    this.setState({
      selectedAnnotationId: null,
      selectedAnnotationSpanId: null,
      selectedEntityType: null,
      selectedEntityId: null,
    });
  }

  setDrawerState(state: DrawerMode) {
    this.setState({ drawerMode: state });
  }

  /**
   * Will scroll a symbol horizontally into view when the drawer opens
   * if it is now obscured by the drawer.
   */
  scrollSymbolIntoView() {
    const {
      selectedEntityId,
      selectedEntityType,
      pdfViewer,
      pages,
      symbols,
    } = this.state;
    const DRAWER_WIDTH = 470;
    const SYMBOL_VIEW_PADDING = 50;
    if (
      pdfViewer &&
      pages !== null &&
      symbols !== null &&
      selectedEntityType === "symbol" &&
      selectedEntityId !== null
    ) {
      const symbol = symbols.byId[selectedEntityId];
      const symbolBox = symbol.bounding_boxes[0];
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

  setUserAnnotationType(type: UserAnnotationType) {
    this.setState({ userAnnotationType: type });
  }

  async addUserAnnotation(annotationData: AnnotationData) {
    if (this.props.paperId !== undefined) {
      const id = await api.postAnnotation(
        this.props.paperId.id,
        annotationData
      );
      const { type, page, left, top, width, height } = annotationData;
      const annotation = {
        id,
        type,
        boundingBox: { id, page, left, top, width, height },
      };
      this.setUserAnnotations([...this.state.userAnnotations, annotation]);
      this.setSelectedAnnotationId(`user-annotation-${id}`);
    }
  }

  async updateUserAnnotation(id: string, annotation: Annotation) {
    if (this.props.paperId !== undefined) {
      const { type, boundingBox } = annotation;
      const { page, left, top, width, height } = boundingBox;
      const annotationData = { type, page, left, top, width, height };
      const updatedAnnotation = await api.putAnnotation(
        this.props.paperId.id,
        id,
        annotationData
      );

      /*
       * Update annotation type for creating new annotations to the type of the most recently
       * changed annotation.
       */
      this.setUserAnnotationType(updatedAnnotation.type);

      const annotations = this.state.userAnnotations.map((a) =>
        a.id === id ? updatedAnnotation : a
      );
      this.setUserAnnotations(annotations);
    }
  }

  async deleteUserAnnotation(id: string) {
    if (this.props.paperId !== undefined) {
      await api.deleteAnnotation(this.props.paperId.id, id);
      const annotations = this.state.userAnnotations.filter((a) => a.id !== id);
      this.setUserAnnotations(annotations);
    }
  }

  setUserAnnotations(annotations: Annotation[]) {
    this.setState({ userAnnotations: annotations });
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

  toggleUserAnnotationMode() {
    this.setState((prevState) => ({
      userAnnotationsEnabled: !prevState.userAnnotationsEnabled,
    }));
  }

  startTextSearch() {
    this.setState({
      isFindActive: true,
      findActivationTimeMs: Date.now(),
      findMode: "pdfjs-builtin-find",
    });
  }

  startSymbolSearch(symbolId: string) {
    if (this.state.symbols === null || this.state.mathMls === null) {
      return;
    }

    const matching = matchingSymbols(
      symbolId,
      this.state.symbols,
      this.state.mathMls
    );
    const matchCount = matching.length;
    const matchIndex = matching.indexOf(symbolId);

    this.setState({
      isFindActive: true,
      findMode: "symbol",
      findActivationTimeMs: Date.now(),
      findQuery: {
        byId: {
          "exact-match": {
            active: true,
            key: "exact-match",
          },
          "partial-match": {
            active: true,
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

  setFindMatchCount(findMatchCount: number | null) {
    this.setState({ findMatchCount });
  }

  setFindMatchIndex(findMatchIndex: number | null) {
    this.setState({ findMatchIndex });
  }

  /*
   * TODO(andrewhead): split this into pieces, reuse its code. Too big.
   */
  setFindQuery(findQuery: FindQuery) {
    this.setState((state) => {
      if (
        state.findMode === "symbol" &&
        state.selectedEntityId !== null &&
        state.symbols !== null &&
        state.mathMls !== null
      ) {
        const symbolFilters = findQuery as SymbolFilters;
        const filterList =
          symbolFilters !== null
            ? Object.values(symbolFilters.byId)
            : undefined;
        const matching = matchingSymbols(
          state.selectedEntityId,
          state.symbols,
          state.mathMls,
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
      // TODO(andrewhead): where to move this?
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
        const citations = await api.citationsForArxivId(this.props.paperId.id);
        const s2Ids = citations.map((c) => c.paper);
        if (s2Ids.length >= 1) {
          const papers = (await api.papers(s2Ids)).reduce((papers, paper) => {
            papers[paper.s2Id] = paper;
            return papers;
          }, {} as { [s2Id: string]: Paper });
          this.setState({ papers });
        }
        /*
         * Wait to set the citations until paper data has been fetched, so that citations are
         * only shown when there's something to show for them.
         */
        this.setState({
          citations: createRelationalStoreFromArray(citations, "id"),
        });

        const symbols = await api.symbolsForArxivId(this.props.paperId.id);
        if (symbols.length >= 1) {
          const mathMls = await api.mathMlForArxivId(this.props.paperId.id);
          const mathMlsWithSymbols = mathMls.map((m) => {
            return {
              ...m,
              symbols: symbols
                .filter((s) => s.mathml === m.id)
                .map((s) => s.id),
            };
          });
          this.setState({
            mathMls: createRelationalStoreFromArray(mathMlsWithSymbols, "id"),
          });
        }
        /*
         * Wait to set the symbols until MathML data has been fetched, as parts of the interface
         * that display symbols require MathML to function properly.
         */
        this.setState({
          symbols: createRelationalStoreFromArray(symbols, "id"),
        });

        const sentences = await api.sentencesForArxivId(this.props.paperId.id);
        this.setState({
          sentences: createRelationalStoreFromArray(sentences, "id"),
        });

        const annotations = await api.annnotationsForArxivId(
          this.props.paperId.id
        );
        this.setUserAnnotations(annotations);

        const userLibrary = await api.getUserLibraryInfo();
        if (userLibrary) {
          this.setState({ userLibrary });
        }
      }
    }
  }

  jumpToBoundingBox(box: BoundingBox) {
    /*
     * Based roughly on the scroll offsets used for pdf.js "find" functionality:
     * https://github.com/mozilla/pdf.js/blob/16ae7c6960c1296370c1600312f283a68e82b137/web/pdf_find_controller.js#L190-L191
     * TODO(andrewhead): this offset should be in viewport coordinates, not PDF coordinates.
     */
    const SCROLL_OFFSET_X = -400;
    const SCROLL_OFFSET_Y = +100;

    if (
      this.state.pdfViewer !== null &&
      this.state.pages !== null &&
      this.state.pages[box.page + 1] !== undefined
    ) {
      const { left, top } = selectors.divDimensionStyles(
        this.state.pages[box.page + 1].view,
        box
      );
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
    const elFeedbackContainer = document.getElementById(
      "scholarReaderGlobalFeedbackButton"
    );
    const elUserAnnotationTypeContainer = document.getElementById(
      "scholarReaderAnnotationTypeSelect"
    );

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
        {this.state.pages !== null ? (
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
                  view={pageModel.view}
                  pageNumber={pageNumber}
                  papers={this.state.papers}
                  citations={this.state.citations}
                  symbols={this.state.symbols}
                  mathMls={this.state.mathMls}
                  sentences={this.state.sentences}
                  userLibrary={this.state.userLibrary}
                  selectedEntityType={this.state.selectedEntityType}
                  selectedEntityId={this.state.selectedEntityId}
                  selectedAnnotationId={this.state.selectedAnnotationId}
                  selectedAnnotationSpanId={this.state.selectedAnnotationSpanId}
                  findMatchedEntityIds={this.state.findMatchedEntities}
                  findSelectionEntityId={findMatchEntityId}
                  showAnnotations={this.state.annotationsShowing}
                  userAnnotations={this.state.userAnnotations as Annotation[]}
                  userAnnotationsEnabled={this.state.userAnnotationsEnabled}
                  userAnnotationType={this.state.userAnnotationType}
                  handleSelectEntity={this.setSelectedEntity}
                  handleSelectAnnotation={this.setSelectedAnnotationId}
                  handleSelectAnnotationSpan={this.setSelectedAnnotationSpanId}
                  handleStartSymbolSearch={this.startSymbolSearch}
                  handleAddPaperToLibrary={this.addToLibrary}
                  handleAddUserAnnotation={this.addUserAnnotation}
                  handleUpdateUserAnnotation={this.updateUserAnnotation}
                  handleDeleteUserAnnotation={this.deleteUserAnnotation}
                />
              );
            })}
          </>
        ) : null}
        {this.state.pdfViewer !== null ? (
          <>
            <AppOverlay
              appContainer={document.body}
              handleHideAnnotations={this.hideAnnotations}
              handleShowAnnotations={this.showAnnotations}
              handleDeselectSelection={this.deselectSelection}
              handleStartTextSearch={this.startTextSearch}
              handleTerminateSearch={this.closeFindBar}
              handleCloseDrawer={this.closeDrawer}
              handleToggleUserAnnotationMode={this.toggleUserAnnotationMode}
            />
            <ViewerOverlay
              pdfViewer={this.state.pdfViewer}
              handleDeselectSelection={this.deselectSelection}
            />
            <Drawer
              paperId={this.props.paperId}
              pdfViewer={this.state.pdfViewer}
              pdfDocument={this.state.pdfDocument}
              mode={this.state.drawerMode}
              userLibrary={this.state.userLibrary}
              papers={this.state.papers}
              symbols={this.state.symbols}
              mathMls={this.state.mathMls}
              sentences={this.state.sentences}
              selectedEntityType={this.state.selectedEntityType}
              selectedEntityId={this.state.selectedEntityId}
              handleScrollSymbolIntoView={this.scrollSymbolIntoView}
              handleClose={this.closeDrawer}
              handleAddPaperToLibrary={this.addToLibrary}
              handleSelectSymbol={this.selectSymbol}
            />
          </>
        ) : null}
        {elFeedbackContainer
          ? createPortal(
              <FeedbackButton paperId={this.props.paperId} variant="toolbar" />,
              elFeedbackContainer
            )
          : null}
        {this.state.userAnnotationsEnabled && elUserAnnotationTypeContainer
          ? createPortal(
              <UserAnnotationTypeSelect
                annotationType={this.state.userAnnotationType}
                handleSelectType={this.setUserAnnotationType}
              />,
              elUserAnnotationTypeContainer
            )
          : null}
        {this.state.pdfViewerApplication !== null &&
        this.state.isFindActive &&
        this.state.findActivationTimeMs !== null ? (
          <FindBar
            /*
             * Key this widget with the time that the find event was activated
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
