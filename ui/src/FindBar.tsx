import React from "react";
import { EventBus } from "./types/pdfjs-viewer";

interface FindBarState {
  currentMatch: number | null;
  matchCount: number | null;
  /**
   * Event bus for the pdf.js application. The logic for performing text search within the PDF is
   * provided by pdf.js. This event bus is needed for communicating with the pdf.js code.
   */
  pdfJsEventBus?: EventBus;
}

export class FindBar extends React.PureComponent<{}, FindBarState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      currentMatch: null,
      matchCount: null,
    };
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeydown.bind(this));

    /*
     * XXX(andrewhead): Find a cleaner way to plug into the pdf.js find controller.
     * See https://github.com/allenai/scholar-reader/issues/96 for a discussion of alternatives.
     * This is for prototyping purposes only. One of the annoying aspects of having this code
     * in 'componentDidMount' is that it means that the component that creates FindBar needs to
     * make sure PDFViwerApplication has been initialized before creating the FindBar.
     */
    /*
     * TODO(andrewhead): even with this hack, we should be listening for PDFViewerApplication to
     * be initiatilized (using its '.initialized' property) before doing anything with it.
     */
    const pdfViewerApplicationAny: any = window.PDFViewerApplication;
    pdfViewerApplicationAny.externalServices = {
      ...pdfViewerApplicationAny.externalServices,
      updateFindControlState: (data: any) => {
        console.log("Updating find control state", data);
      },
      updateFindMatchesCount: (data: any) => {
        console.log("Update find matches count", data);
      },
      supportsIntegratedFind: true,
    };
    pdfViewerApplicationAny.appConfig.toolbar.viewFind.classList.add("hidden");
    this.setState({
      pdfJsEventBus: pdfViewerApplicationAny.eventBus,
    });
  }

  initializeQueryElement(queryElement: HTMLInputElement | null) {
    if (queryElement !== null) {
      this.queryElement = queryElement;
      this.queryElement.addEventListener(
        "input",
        this.handleQueryChange.bind(this)
      );
    }
  }

  handleKeydown(event: KeyboardEvent) {
    /*
     * This logic for listening for Ctrl+F and for opening the find bar is based on the analogous
     * code in the pdf.js project:
     * https://github.com/mozilla/pdf.js/blob/49f59eb627646ae9a6e166ee2e0ef2cac9390b4f/web/app.js#L2503
     */
    if ((event.ctrlKey || event.metaKey) && event.keyCode === 70) {
      const opened = this.open();
      if (opened) {
        event.preventDefault();
      }
    }
  }

  open() {
    if (this.queryElement !== null) {
      this.queryElement.focus();
      this.queryElement.select();
      return true;
    }
    return false;
  }

  handleQueryChange() {
    /*
     * Code for dispatching events to the find controller from outside are based on
     * https://github.com/mozilla/pdf.js/blob/49f59eb627646ae9a6e166ee2e0ef2cac9390b4f/web/firefoxcom.js#L190-L200
     */
    this.dispatchEventToPdfJs("find");
  }

  handleNextButtonClick() {
    this.dispatchEventToPdfJs("findagain");
  }

  handlePreviousButtonClick() {
    this.dispatchEventToPdfJs("findagain", true);
  }

  dispatchEventToPdfJs(eventType: string, findPrevious?: boolean) {
    if (this.queryElement === null) {
      return;
    }
    const query = this.queryElement.value;
    if (this.state.pdfJsEventBus) {
      this.state.pdfJsEventBus.dispatch("find", {
        source: window,
        type: eventType.substring("find".length),
        query,
        phraseSearch: true,
        caseSensitive: false,
        entireWord: false,
        highlightAll: false,
        findPrevious: findPrevious || false,
      });
    }
  }

  /*
   * Based on 'PDFFindBar.updateResultsCount' in pdf.js:
   * https://github.com/mozilla/pdf.js/blob/49f59eb627646ae9a6e166ee2e0ef2cac9390b4f/web/pdf_find_bar.js#L152
   */
  matchCountMessage() {
    const MATCH_COUNT_LIMIT = 1000;

    const { currentMatch, matchCount } = this.state;
    if (currentMatch === null || matchCount === null) {
      return null;
    }

    if (matchCount > MATCH_COUNT_LIMIT) {
      return `More than ${MATCH_COUNT_LIMIT} matches`;
    }

    return `${currentMatch} of ${matchCount} matches`;
  }

  render() {
    return (
      <div className="find-bar">
        <input
          className="find-bar__query"
          placeholder="Find in document…"
          ref={this.initializeQueryElement.bind(this)}
          tabIndex={0}
        />
        <div className="find-bar__navigation">
          <button
            className="find-bar__navigation__previous"
            onClick={this.handlePreviousButtonClick.bind(this)}
          >
            <span>Previous</span>
          </button>
          <button
            className="find-bar__navigation__next"
            onClick={this.handleNextButtonClick.bind(this)}
          >
            <span>Next</span>
          </button>
        </div>
        <div className="find-bar__message">
          <span className="find-bar__message__span">
            {this.matchCountMessage()}
          </span>
        </div>
      </div>
    );
  }

  queryElement: HTMLInputElement | null = null;
}

export default FindBar;
