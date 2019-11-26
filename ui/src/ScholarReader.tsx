import React from "react";
import * as api from "./api";
import Drawer from "./Drawer";
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
import { Citation, MathMl, Paper, Symbol } from "./types/api";
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
      drawerState: "closed",
      setDrawerState: this.setDrawerState.bind(this),
      selectedSymbol: null,
      setSelectedSymbol: this.setSelectedSymbol.bind(this),
      jumpSymbol: null,
      setJumpSymbol: this.setJumpSymbol.bind(this)
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

  setDrawerState(state: DrawerState) {
    this.setState({ drawerState: state });
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

  async componentDidMount() {
    waitForPDFViewerInitialization().then(application => {
      this.subscribeToPDFViewerStateChanges(application);
    });
    this.loadCitations();
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
