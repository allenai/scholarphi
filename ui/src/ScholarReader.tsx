import React from "react";
import * as api from "./api";
import PageOverlay from "./PageOverlay";
import { Pages, PaperId, Papers, ScholarReaderContext, State } from "./state";
import "./style/index.less";
import { Citation, Paper, Symbol } from "./types/api";
import { PageRenderedEvent, PDFViewerApplication } from "./types/pdfjs-viewer";

interface ScholarReaderProps {
  paperId?: PaperId;
}

class ScholarReader extends React.Component<ScholarReaderProps, State> {
  constructor(props: ScholarReaderProps) {
    super(props);
    this.state = {
      citations: [],
      symbols: [],
      papers: {},
      pages: {},
      setCitations: this.setCitations,
      setSymbols: this.setSymbols,
      setPapers: this.setPapers,
      setPages: this.setPages
    };
  }

  setCitations(citations: Citation[]) {
    this.setState({ ...this.state, citations });
  }

  setSymbols(symbols: Symbol[]) {
    this.setState({ ...this.state, symbols });
  }

  setPapers(papers: Papers) {
    this.setState({ ...this.state, papers });
  }

  setPages(pages: Pages) {
    this.setState({ ...this.state, pages });
  }

  async componentDidMount() {
    waitForPDFViewerInitialization().then(application => {
      this.subscribeToPDFViewerStateChanges(application);
    });
    this.loadCitations();
  }

  subscribeToPDFViewerStateChanges(pdfViewerApplication: PDFViewerApplication) {
    const { eventBus } = pdfViewerApplication;
    /*
     * TODO(andrewhead): Do we need to add pages that are *already loaded* at initialization time
     * to the state? Or will 'pagerendered' always run after this component is mounted?
     */
    eventBus.on("pagerendered", (eventData: PageRenderedEvent) => {
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
          const papers = (await api.papers(s2Ids)).reduce(
            (papers, paper) => {
              papers[paper.s2Id] = paper;
              return papers;
            },
            {} as { [s2Id: string]: Paper }
          );
          this.setPapers(papers);
        }

        const symbols = await api.symbolsForArxivId(this.props.paperId.id);
        this.setSymbols(symbols);
      }
    }
  }

  render() {
    return (
      <ScholarReaderContext.Provider value={this.state}>
        {Object.keys(this.state.pages).map(pageNumberKey => {
          const pageNumber = Number(pageNumberKey);
          const pageModel = this.state.pages[pageNumber];
          /*
           * By setting the key to the page number *and* the timestamp it was rendered, React will
           * know to replace a page overlay when a pdf.js re-renders a page.
           */
          const key = `${pageNumber}-${pageModel.timeOfLastRender}`;
          return <PageOverlay key={key} view={pageModel.view} pageNumber={pageNumber} />;
        })}
        ;
      </ScholarReaderContext.Provider>
    );
  }
}

async function waitForPDFViewerInitialization() {
  return new Promise<PDFViewerApplication>(resolve => {
    const CHECK_CYCLE_MS = 50;
    function check() {
      if (window.PDFViewerApplication !== undefined && window.PDFViewerApplication.initialized) {
        resolve(window.PDFViewerApplication);
      } else {
        setTimeout(check, CHECK_CYCLE_MS);
      }
    }
    check();
  });
}

export default ScholarReader;
