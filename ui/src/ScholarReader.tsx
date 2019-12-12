import React from "react";
import * as api from "./api";
import Drawer from "./Drawer";
import { FavoritableId, favoritesKey } from "./FavoriteButton";
import PageOverlay from "./PageOverlay";
import {
  DrawerState,
  Pages,
  PaperId,
  Papers,
  ScholarReaderContext,
  State
} from "./state";
import "./style/index.less";
import {
  Annotation,
  AnnotationData,
  Citation,
  MathMl,
  Paper,
  Symbol
} from "./types/api";
import {
  DocumentLoadedEvent,
  PageRenderedEvent,
  PDFViewerApplication
} from "./types/pdfjs-viewer";

interface ScholarReaderProps {
  paperId?: PaperId;
}

class ScholarReader extends React.Component<ScholarReaderProps, State> {
  constructor(props: ScholarReaderProps) {
    super(props);
    /*
     * Bind all setters to 'this' so that 'setState' resolves to this object when the setters
     * are called from outside ScholarReader.
     */
    this.state = {
      citations: [],
      setCitations: this.setCitations.bind(this),
      symbols: [],
      setSymbols: this.setSymbols.bind(this),
      mathMl: [],
      setMathMl: this.setMathMl.bind(this),
      papers: {},
      setPapers: this.setPapers.bind(this),
      pages: {},
      setPages: this.setPages.bind(this),
      pdfDocument: null,
      pdfViewer: null,
      favorites: {},
      toggleFavorite: this.toggleFavorite.bind(this),
      drawerState: "closed",
      setDrawerState: this.setDrawerState.bind(this),
      jumpPaperId: null,
      setJumpPaperId: this.setJumpPaperId.bind(this),
      selectedSymbol: null,
      setSelectedSymbol: this.setSelectedSymbol.bind(this),
      jumpSymbol: null,
      setJumpSymbol: this.setJumpSymbol.bind(this),
      annotationEnabled: false,
      setAnnotationEnabled: this.setAnnotationEnabled.bind(this),
      annotationType: "citation",
      setAnnotationType: this.setAnnotationType.bind(this),
      annotations: [],
      addAnnotation: this.addAnnotation.bind(this),
      updateAnnotation: this.updateAnnotation.bind(this),
      deleteAnnotation: this.deleteAnnotation.bind(this),
      setAnnotations: this.setAnnotations.bind(this),
      selectedAnnotation: null,
      setSelectedAnnotation: this.setSelectedAnnotation.bind(this)
    };
  }

  setCitations(citations: Citation[]) {
    this.setState({ citations });
  }

  setSymbols(symbols: Symbol[]) {
    this.setState({ symbols });
  }

  setMathMl(mathMl: MathMl[]) {
    this.setState({ mathMl });
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

  setDrawerState(state: DrawerState) {
    this.setState({ drawerState: state });
  }

  setJumpPaperId(s2Id: string) {
    this.setState({ jumpPaperId: s2Id });
  }

  setSelectedSymbol(symbol: Symbol | null) {
    this.setState({ selectedSymbol: symbol });
  }

  setJumpSymbol(symbol: Symbol | null) {
    this.setState({ jumpSymbol: symbol });
    if (symbol !== null) {
      this.jumpToSymbol(symbol);
    }
  }

  setAnnotationEnabled(enabled: boolean) {
    this.setState({ annotationEnabled: enabled });
  }

  setAnnotationType(type: "citation" | "symbol") {
    this.setState({ annotationType: type });
  }

  async addAnnotation(annotationData: AnnotationData) {
    if (this.props.paperId !== undefined) {
      const id = await api.postAnnotation(
        this.props.paperId.id,
        annotationData
      );
      const annotation = { ...annotationData, id };
      this.setAnnotations([...this.state.annotations, annotation]);
      this.setSelectedAnnotation(annotation);
    }
  }

  async updateAnnotation(id: number, annotation: Annotation) {
    if (this.props.paperId !== undefined) {
      const { type, boundingBox } = annotation;
      const annotationData = { type, boundingBox };
      const updatedAnnotation = await api.putAnnotation(
        this.props.paperId.id,
        id,
        annotationData
      );

      /*
       * Update annotation type for creating new annotations to the type of the most recently
       * changed annotation.
       */
      this.setAnnotationType(updatedAnnotation.type);

      const annotations = this.state.annotations.map(a =>
        a.id === id ? updatedAnnotation : a
      );
      this.setAnnotations(annotations);
    }
  }

  async deleteAnnotation(id: number) {
    if (this.props.paperId !== undefined) {
      await api.deleteAnnotation(this.props.paperId.id, id);
      const annotations = this.state.annotations.filter(a => a.id !== id);
      this.setAnnotations(annotations);
    }
  }

  setAnnotations(annotations: Annotation[]) {
    this.setState({ annotations });
  }

  setSelectedAnnotation(annotation: Annotation | null) {
    this.setState({ selectedAnnotation: annotation });
  }

  async componentDidMount() {
    waitForPDFViewerInitialization().then(application => {
      this.subscribeToPDFViewerStateChanges(application);
    });
    this.loadCitations();
    document.onkeypress = (e: KeyboardEvent) => {
      if (e.key !== "a" && e.ctrlKey && e.shiftKey) {
        this.setAnnotationEnabled(!this.state.annotationEnabled);
      }
    };
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

  async loadCitations() {
    if (this.props.paperId !== undefined) {
      if (this.props.paperId.type === "arxiv") {
        const citations = await api.citationsForArxivId(this.props.paperId.id);
        this.setCitations(citations);

        const s2Ids = citations.map(c => c.papers).flat();
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
        }

        const annotations = await api.annnotationsForArxivId(
          this.props.paperId.id
        );
        this.setAnnotations(annotations);
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
      const box = symbol.bounding_box;
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

  render() {
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
