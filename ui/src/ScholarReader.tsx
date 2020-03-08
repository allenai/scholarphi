import React from "react";
import { createPortal } from "react-dom";
import * as api from "./api";
import Drawer from "./Drawer";
import { FavoritableId, favoritesKey } from "./FavoriteButton";
import FeedbackButton from "./FeedbackButton";
import PageOverlay from "./PageOverlay";
import * as selectors from "./selectors";
import { Pages, PaperId, Papers, ScholarReaderContext, State } from "./state";
import "./style/index.less";
import {
  Annotation,
  AnnotationData,
  Citation,
  MathMl,
  Paper,
  Sentence,
  Symbol,
  SymbolMatches,
  UserAnnotationType,
  UserLibrary
} from "./types/api";
import {
  DocumentLoadedEvent,
  PageRenderedEvent,
  PDFViewerApplication
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
    /*
     * Bind all setters to 'this' so that 'setState' resolves to this object when the setters
     * are called from outside ScholarReader.
     */
    this.state = {
      userLibrary: null,
      setUserLibrary: this.setUserLibrary.bind(this),
      addToLibrary: this.addToLibrary.bind(this),
      paperId: props.paperId,
      citations: [],
      setCitations: this.setCitations.bind(this),
      symbols: [],
      setSymbols: this.setSymbols.bind(this),
      symbolMatches: {},
      setSymbolMatches: this.setSymbolMatches.bind(this),
      mathMl: [],
      setMathMl: this.setMathMl.bind(this),
      sentences: [],
      setSentences: this.setSentences.bind(this),
      papers: {},
      setPapers: this.setPapers.bind(this),
      pages: {},
      setPages: this.setPages.bind(this),
      pdfDocument: null,
      pdfViewer: null,
      favorites: {},
      toggleFavorite: this.toggleFavorite.bind(this),
      jumpPaperId: null,
      setJumpPaperId: this.setJumpPaperId.bind(this),
      selectedSymbol: null,
      setSelectedSymbol: this.setSelectedSymbol.bind(this),
      scrollSymbolHorizontallyIntoView: this.scrollSymbolHorizontallyIntoView.bind(
        this
      ),
      selectedCitation: null,
      setSelectedCitation: this.setSelectedCitation.bind(this),
      jumpSymbol: null,
      setJumpSymbol: this.setJumpSymbol.bind(this),
      annotationsShowing: true,
      setAnnotationsShowing: this.setAnnotationsShowing.bind(this),
      userAnnotationsEnabled: false,
      setUserAnnotationsEnabled: this.setUserAnnotationsEnabled.bind(this),
      userAnnotationType: "citation",
      setUserAnnotationType: this.setUserAnnotationType.bind(this),
      userAnnotations: [],
      addUserAnnotation: this.addUserAnnotation.bind(this),
      updateUserAnnotation: this.updateUserAnnotation.bind(this),
      deleteUserAnnotation: this.deleteUserAnnotation.bind(this),
      setUserAnnotations: this.setUserAnnotations.bind(this),
      selectedAnnotationId: null,
      setSelectedAnnotationId: this.setSelectedAnnotationId.bind(this),
      selectedAnnotationSpanId: null,
      setSelectedAnnotationSpanId: this.setSelectedAnnotationSpanId.bind(this)
    };
    /**
     * Bind event handlers so that they are always called with 'this' as its context.
     */
    this.toggleUserAnnotationState = this.toggleUserAnnotationState.bind(this);
    this.closeDrawerOnEscape = this.closeDrawerOnEscape.bind(this);
    this.showAnnotationsOnAltDown = this.showAnnotationsOnAltDown.bind(this);
    this.hideAnnotationsOnAltUp = this.hideAnnotationsOnAltUp.bind(this);
  }

  setUserLibrary(userLibrary: UserLibrary | null) {
    this.setState({ userLibrary });
  }

  setCitations(citations: Citation[]) {
    this.setState({ citations });
  }

  setSymbols(symbols: Symbol[]) {
    this.setState({ symbols });
  }

  setSymbolMatches(symbolMatches: SymbolMatches) {
    this.setState({ symbolMatches });
  }

  setMathMl(mathMl: MathMl[]) {
    this.setState({ mathMl });
  }

  setSentences(sentences: Sentence[]) {
    this.setState({ sentences });
  }

  setPapers(papers: Papers) {
    this.setState({ papers });
  }

  setPages(pages: Pages) {
    this.setState({ pages });
  }

  toggleFavorite(favoritableId: FavoritableId) {
    const favorites = { ...this.state.favorites };
    const key = favoritesKey(favoritableId);
    if (favorites[key] === undefined || favorites[key] === false) {
      favorites[key] = true;
    } else {
      favorites[key] = false;
    }
    this.setState({ favorites });
  }

  setJumpPaperId(s2Id: string) {
    this.setState({ jumpPaperId: s2Id });
  }

  setSelectedSymbol(symbol: Symbol | null) {
    this.setState({ selectedSymbol: symbol });
  }

  setSelectedCitation(citation: Citation | null) {
    this.setState({ selectedCitation: citation });
  }

  setJumpSymbol(symbol: Symbol | null) {
    this.setState({ jumpSymbol: symbol });
    if (symbol !== null) {
      this.jumpToSymbol(symbol);
    }
  }

  setAnnotationsShowing(showing: boolean) {
    this.setState({ annotationsShowing: showing });
  }

  setSelectedAnnotationId(id: string | null) {
    this.setState({ selectedAnnotationId: id });
  }

  setSelectedAnnotationSpanId(id: number | null) {
    this.setState({ selectedAnnotationSpanId: id });
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
        boundingBox: { id, page, left, top, width, height }
      };
      this.setUserAnnotations([...this.state.userAnnotations, annotation]);
      this.setSelectedAnnotationId(`user-annotation-${id}`);
    }
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

  async updateUserAnnotation(id: number, annotation: Annotation) {
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

      const annotations = this.state.userAnnotations.map(a =>
        a.id === id ? updatedAnnotation : a
      );
      this.setUserAnnotations(annotations);
    }
  }

  async deleteUserAnnotation(id: number) {
    if (this.props.paperId !== undefined) {
      await api.deleteAnnotation(this.props.paperId.id, id);
      const annotations = this.state.userAnnotations.filter(a => a.id !== id);
      this.setUserAnnotations(annotations);
    }
  }

  setUserAnnotations(annotations: Annotation[]) {
    this.setState({ userAnnotations: annotations });
  }

  closeDrawerOnEscape(event: KeyboardEvent) {
    if (isKeypressEscape(event)) {
      this.setSelectedCitation(null);
      this.setSelectedSymbol(null);
    }
  }

  showAnnotationsOnAltDown(event: KeyboardEvent) {
    /*
    if (event.altKey) {
      this.setAnnotationsShowing(true);
    }
    */
  }

  hideAnnotationsOnAltUp(event: KeyboardEvent) {
    /*
    if (event.keyCode === 18 || event.key === "Alt") {
        this.setAnnotationsShowing(false);
    }
    */
  }

  toggleUserAnnotationState(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.key !== "a") {
      this.setUserAnnotationsEnabled(!this.state.userAnnotationsEnabled);
    }
  }

  async componentDidMount() {
    waitForPDFViewerInitialization().then(application => {
      this.subscribeToPDFViewerStateChanges(application);
    });
    this.loadDataFromApi();
    window.addEventListener("keypress", this.toggleUserAnnotationState);
    window.addEventListener("keydown", this.closeDrawerOnEscape);
    window.addEventListener("keydown", this.showAnnotationsOnAltDown);
    window.addEventListener("keyup", this.hideAnnotationsOnAltUp);
  }

  componentWillUnmount() {
    window.removeEventListener("keypress", this.toggleUserAnnotationState);
    window.removeEventListener("keydown", this.closeDrawerOnEscape);
    window.removeEventListener("keydown", this.showAnnotationsOnAltDown);
    window.removeEventListener("keyup", this.hideAnnotationsOnAltUp);
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
          view: eventData.source
        }
      });
    });
  }

  async loadDataFromApi() {
    if (this.props.paperId !== undefined) {
      if (this.props.paperId.type === "arxiv") {
        const citations = await api.citationsForArxivId(this.props.paperId.id);
        this.setCitations(citations);

        const s2Ids = citations.map(c => c.paper);
        if (s2Ids.length >= 1) {
          const papers = (await api.papers(s2Ids)).reduce((papers, paper) => {
            papers[paper.s2Id] = paper;
            return papers;
          }, {} as { [s2Id: string]: Paper });
          this.setPapers(papers);
        }

        const symbols = await api.symbolsForArxivId(this.props.paperId.id);
        this.setSymbols(symbols);

        if (symbols.length >= 1) {
          const mathMl = await api.mathMlForArxivId(this.props.paperId.id);
          this.setMathMl(mathMl);

          /**
           * Build a mapping from symbol to all possible parent matches.
           * Step 1: Find all matches (using matchingSymbols) for said symbol
           * Step 2: Find the 'top' most parent of every matching symbol since
           *         this is the symbol that is clickable
           * Step 3: Add top parent id of every matching symbol to symbolMatches
           */
          const symbolMatches: SymbolMatches = {};
          symbols.forEach(sym => {
            symbolMatches[sym.id] = new Set(
              selectors.matchingSymbols(sym, symbols, mathMl).map(symMatch => {
                let curr: Symbol = symMatch;
                while (curr.parent != null) {
                  const parent = symbols.find(s => s.id === curr.parent);
                  if (parent) {
                    curr = parent;
                  } else {
                    break;
                  }
                }
                return curr.id;
              })
            );
          });
          this.setSymbolMatches(symbolMatches);
        }

        const sentences = await api.sentencesForArxivId(this.props.paperId.id);
        this.setSentences(sentences);

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

  jumpToSymbol(symbol: Symbol) {
    /*
     * Based roughly on the scroll offsets used for pdf.js "find" functionality:
     * https://github.com/mozilla/pdf.js/blob/16ae7c6960c1296370c1600312f283a68e82b137/web/pdf_find_controller.js#L190-L191
     * TODO(andrewhead): this offset should be in viewport coordinates, not PDF coordinates.
     */
    const SCROLL_OFFSET_X = -400;
    const SCROLL_OFFSET_Y = +100;

    if (this.state.pdfViewer !== null) {
      const box = symbol.bounding_boxes[0];
      this.state.pdfViewer.scrollPageIntoView({
        pageNumber: box.page + 1,
        destArray: [
          undefined,
          { name: "XYZ" },
          box.left + SCROLL_OFFSET_X,
          box.top + SCROLL_OFFSET_Y
        ]
      });
    }
  }

  /**
   * Will scroll a symbol horizontally into view when the drawer opens
   * if it is now obscured by the drawer.
   */
  scrollSymbolHorizontallyIntoView() {
    const { selectedSymbol, pdfViewer, pages } = this.state;
    const DRAWER_WIDTH = 470;
    const SYMBOL_VIEW_PADDING = 50;
    if (pdfViewer && selectedSymbol) {
      const symBounds = selectedSymbol.bounding_boxes[0];
      const pdfLeft = (pdfViewer.container.getBoundingClientRect() as DOMRect)
        .x;
      if (pages[symBounds.page + 1].view != null) {
        const { left, width } = selectors.divDimensionStyles(
          pages[symBounds.page + 1].view,
          symBounds
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

  render() {
    const elFeedbackContainer = document.getElementById(
      "scholarReaderGlobalFeedbackButton"
    );
    const elUserAnnotationTypeContainer = document.getElementById(
      "scholarReaderAnnotationTypeSelect"
    );
    return (
      <ScholarReaderContext.Provider value={this.state}>
        <>
          {Object.keys(this.state.pages).map(pageNumberKey => {
            const pageNumber = Number(pageNumberKey);
            const pageModel = this.state.pages[pageNumber];
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
              />
            );
          })}
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
        </>
      </ScholarReaderContext.Provider>
    );
  }
}

async function waitForPDFViewerInitialization() {
  return new Promise<PDFViewerApplication>(resolve => {
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
