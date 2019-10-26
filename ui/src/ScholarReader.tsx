import React from "react";
import PageOverlay from "./PageOverlay";
import "./ScholarReader.scss";
import { initialState, ScholarReaderContext, State } from "./state";
import { PageRenderedEvent, PDFViewerApplication } from "./types/pdfjs-viewer";

class ScholarReader extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      citations: [],
      pages: {}
    };
  }

  async componentDidMount() {
    const application = await waitForPDFViewerInitialization();
    this.subscribeToPDFViewerStateChanges(application);
  }

  subscribeToPDFViewerStateChanges(pdfViewerApplication: PDFViewerApplication) {
    const { eventBus } = pdfViewerApplication;
    eventBus.on("pagerendered", (eventData: PageRenderedEvent) => {
      this.setState({
        pages: {
          ...this.state.pages,
          [eventData.pageNumber]: {
            timeOfLastRender: eventData.timestamp,
            view: eventData.source
          }
        }
      });
    });
  }

  render() {
    return (
      <ScholarReaderContext.Provider value={initialState}>
        {Object.keys(this.state.pages).map(pageNumber => {
          const pageModel = this.state.pages[Number(pageNumber)];
          /*
           * By setting the key to the page number *and* the timestamp it was rendered, React will
           * know to replace a page overlay when a pdf.js re-renders a page.
           */
          const key = `${pageNumber}-${pageModel.timeOfLastRender}`;
          return <PageOverlay key={key} view={pageModel.view} />;
        })}
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
