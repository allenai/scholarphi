import React from "react";
import { createPortal } from "react-dom";
import * as api from "./api";
import Drawer from "./Drawer";
import FeedbackButton from "./FeedbackButton";
import FindBar from "./FindBar";
import PageOverlay from "./PageOverlay";
import * as selectors from "./selectors";
import {
  Citations,
  createStateSliceFromArray,
  defaultState,
  DrawerState,
  MathMls,
  Pages,
  PaperId,
  Papers,
  ScholarReaderContext,
  SelectableEntityType,
  Sentences,
  State,
  Symbols,
} from "./state";
import "./style/index.less";
import {
  Annotation,
  AnnotationData,
  BoundingBox,
  Paper,
  UserAnnotationType,
  UserLibrary,
} from "./types/api";
import {
  DocumentLoadedEvent,
  PageRenderedEvent,
  PDFViewerApplication,
} from "./types/pdfjs-viewer";
import { isKeypressEscape } from "./ui-utils";
import { UserAnnotationTypeSelect } from "./UserAnnotationTypeSelect";

interface ScholarReaderProps {
  paperId?: PaperId;
}

class ScholarReader extends React.PureComponent<ScholarReaderProps, State> {
  // See:
  // https://reactjs.org/docs/react-component.html#static-getderivedstatefromprops
  static getDerivedStateFromProps(
    props: ScholarReaderProps,
    currentState: State
  ): Partial<State> | null {
    if (props.paperId === currentState.paperId) {
      return null;
    }
    return { paperId: props.paperId };
  }

  constructor(props: ScholarReaderProps) {
    super(props);
    this.state = Object.assign({}, defaultState, {
      paperId: props.paperId,
      /*
       * Bind all setters to 'this' so that 'setState' resolves to this object when the setters
       * are called from outside ScholarReader.
       */
      setCitations: this.setCitations.bind(this),
      setSymbols: this.setSymbols.bind(this),
      setMathMls: this.setMathMls.bind(this),
      setSentences: this.setSentences.bind(this),
      setPapers: this.setPapers.bind(this),

      setUserLibrary: this.setUserLibrary.bind(this),
      addToLibrary: this.addToLibrary.bind(this),

      setPages: this.setPages.bind(this),

      setAnnotationsShowing: this.setAnnotationsShowing.bind(this),
      setSelectedAnnotationId: this.setSelectedAnnotationId.bind(this),
      setSelectedAnnotationSpanId: this.setSelectedAnnotationSpanId.bind(this),
      setSelectedEntity: this.setSelectedEntity.bind(this),

      requestJumpToPaper: this.requestJumpToPaper.bind(this),

      setDrawerState: this.setDrawerState.bind(this),
      scrollSymbolIntoView: this.scrollSymbolIntoView.bind(this),

      setUserAnnotationsEnabled: this.setUserAnnotationsEnabled.bind(this),
      setUserAnnotationType: this.setUserAnnotationType.bind(this),
      addUserAnnotation: this.addUserAnnotation.bind(this),
      updateUserAnnotation: this.updateUserAnnotation.bind(this),
      deleteUserAnnotation: this.deleteUserAnnotation.bind(this),
      setUserAnnotations: this.setUserAnnotations.bind(this),
    });
    /**
     * Bind event handlers so that they are always called with 'this' as its context.
     */
    this.toggleUserAnnotationState = this.toggleUserAnnotationState.bind(this);
    this.closeDrawerOnEscape = this.closeDrawerOnEscape.bind(this);
    this.hideAnnotationsOnAltDown = this.hideAnnotationsOnAltDown.bind(this);
    this.showAnnotationsOnAltUp = this.showAnnotationsOnAltUp.bind(this);
  }

  setCitations(citations: Citations | null) {
    this.setState({ citations });
  }

  setSymbols(symbols: Symbols | null) {
    this.setState({ symbols });
  }

  setMathMls(mathMls: MathMls | null) {
    this.setState({ mathMls });
  }

  setSentences(sentences: Sentences | null) {
    this.setState({ sentences });
  }

  setPapers(papers: Papers | null) {
    this.setState({ papers });
  }

  setUserLibrary(userLibrary: UserLibrary | null) {
    this.setState({ userLibrary });
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
        this.setUserLibrary({ paperIds });
      }
    }
  }

  setPages(pages: Pages | null) {
    this.setState({ pages });
  }

  setAnnotationsShowing(showing: boolean) {
    this.setState({ annotationsShowing: showing });
  }

  setSelectedAnnotationId(id: string | null) {
    this.setState({ selectedAnnotationId: id });
  }

  setSelectedAnnotationSpanId(id: string | null) {
    this.setState({ selectedAnnotationSpanId: id });
  }

  setSelectedEntity(id: string | null, type: SelectableEntityType) {
    this.setState({ selectedEntityId: id, selectedEntityType: type });
  }

  requestJumpToPaper(s2Id: string) {
    this.setState({ paperJumpRequest: s2Id });
  }

  setDrawerState(state: DrawerState) {
    this.setState({ drawerState: state });
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

  setUserAnnotationsEnabled(enabled: boolean) {
    this.setState({ userAnnotationsEnabled: enabled });
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

  closeDrawerOnEscape(event: KeyboardEvent) {
    if (isKeypressEscape(event)) {
      this.setDrawerState("closed");
    }
  }

  hideAnnotationsOnAltDown(event: KeyboardEvent) {
    if (event.altKey) {
      this.setAnnotationsShowing(false);
    }
  }

  showAnnotationsOnAltUp(event: KeyboardEvent) {
    if (event.keyCode === 18 || event.key === "Alt") {
      this.setAnnotationsShowing(true);
    }
  }

  toggleUserAnnotationState(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.key !== "a") {
      this.setUserAnnotationsEnabled(!this.state.userAnnotationsEnabled);
    }
  }

  async componentDidMount() {
    waitForPDFViewerInitialization().then((application) => {
      this.subscribeToPDFViewerStateChanges(application);
    });
    this.loadDataFromApi();
    window.addEventListener("keypress", this.toggleUserAnnotationState);
    window.addEventListener("keydown", this.closeDrawerOnEscape);
    window.addEventListener("keydown", this.hideAnnotationsOnAltDown);
    window.addEventListener("keyup", this.showAnnotationsOnAltUp);
  }

  componentWillUnmount() {
    window.removeEventListener("keypress", this.toggleUserAnnotationState);
    window.removeEventListener("keydown", this.closeDrawerOnEscape);
    window.removeEventListener("keydown", this.hideAnnotationsOnAltDown);
    window.removeEventListener("keyup", this.showAnnotationsOnAltUp);
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
      this.setState({ pdfDocument: pdfViewerApplication.pdfDocument });
      this.setPages({
        ...this.state.pages,
        [eventData.pageNumber]: {
          timeOfLastRender: eventData.timestamp,
          view: eventData.source,
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
          this.setPapers(papers);
        }
        /*
         * Wait to set the citations until paper data has been fetched, so that citations are
         * only shown when there's something to show for them.
         */
        this.setCitations(createStateSliceFromArray(citations, "id"));

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
          this.setMathMls(createStateSliceFromArray(mathMlsWithSymbols, "id"));
        }
        /*
         * Wait to set the symbols until MathML data has been fetched, as parts of the interface
         * that display symbols require MathML to function properly.
         */
        this.setSymbols(createStateSliceFromArray(symbols, "id"));

        const sentences = await api.sentencesForArxivId(this.props.paperId.id);
        this.setSentences(createStateSliceFromArray(sentences, "id"));

        const annotations = await api.annnotationsForArxivId(
          this.props.paperId.id
        );
        this.setUserAnnotations(annotations);

        const userLibrary = await api.getUserLibraryInfo();
        if (userLibrary) {
          this.setUserLibrary(userLibrary);
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

    if (this.state.pdfViewer !== null && this.state.pages !== null && this.state.pages[box.page + 1] !== undefined) {
      const { left, top } = selectors.divDimensionStyles(
        this.state.pages[box.page + 1].view,
        box 
      )
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
    const elFindBarContainer = document.getElementById("mainContainer");
    const elFeedbackContainer = document.getElementById(
      "scholarReaderGlobalFeedbackButton"
    );
    const elUserAnnotationTypeContainer = document.getElementById(
      "scholarReaderAnnotationTypeSelect"
    );
    const highlightedSymbols: Map<String, BoundingBox> = new Map();
    if (
      this.state.symbols !== null &&
      this.state.mathMls !== null &&
      this.state.selectedEntityType === "symbol" &&
      this.state.selectedEntityId !== null
    ) {
      // we need these highlights to be in sorted
      // order by highlight y value so we must use a Map.
      selectors.matchingSymbols(
        this.state.selectedEntityId,
        this.state.symbols,
        this.state.mathMls
      )
      .map(id => {
        const symbol = this.state.symbols.byId[id];
        const symbolBox = symbol.bounding_boxes[0];
        return [id, symbolBox]
      })
      .sort((s1, s2) => {
        const pg = s1[1].page - s2[1].page;
        return pg === 0 ? s1[1].top - s2[1].top : pg;
      })
      .map(([id, bounding]) => {
        highlightedSymbols.set(id, bounding)  
      })
    }
    return (
      <ScholarReaderContext.Provider value={this.state}>
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
                    view={pageModel.view}
                    pageNumber={pageNumber}
                    highlightedSymbols={[...highlightedSymbols.keys()]}
                  />
                );
              })}
            </>
          ) : null}
          <Drawer />
          {elFeedbackContainer
            ? createPortal(
                <FeedbackButton variant="toolbar" />,
                elFeedbackContainer
              )
            : null}
          {this.state.userAnnotationsEnabled && elUserAnnotationTypeContainer
            ? createPortal(
                <UserAnnotationTypeSelect />,
                elUserAnnotationTypeContainer
              )
            : null}
          {/*
           * TODO(andrewhead): find another way of checking to see if PDFViewerApplication is
           * available, or don't require FindBar to have access to the PDFViewerApplication.
           */}
          {window.PDFViewerApplication !== undefined && elFindBarContainer
            ? createPortal(
                <FindBar 
                  mappingToBounds={highlightedSymbols}
                  matches={[...highlightedSymbols.keys()]}
                  // unfortunately this *must* be a prop or the component will try to 
                  // render with an unselected symbol. This is bc we are using props
                  // as out (unsafe) data stream. This will eventually need to be refactored
                  selectedSymbol={this.state.selectedEntityId}
                  />, 
                elFindBarContainer)
            : null}
        </>
      </ScholarReaderContext.Provider>
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
