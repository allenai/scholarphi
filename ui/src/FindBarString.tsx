import React from "react";
import { EventBus } from "./types/pdfjs-viewer";
import { ScholarReaderContext, FindBarState } from "./state";

interface FindBarStringProps {
  setMode(state: FindBarState): void;
}

interface FindBarStringState {
  currentMatch: number | null;
  matchCount: number | null;
  /**
   * Event bus for the pdf.js application. The logic for performing text search within the PDF is
   * provided by pdf.js. This event bus is needed for communicating with the pdf.js code.
   */
  pdfJsEventBus?: EventBus;
}

const initialState = {
  currentMatch: null,
  matchCount: null,
}

export class FindBarString extends React.PureComponent<FindBarStringProps, FindBarStringState> {
  state = initialState;
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  componentDidMount() {
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
      updateFindControlState: ({matchesCount: {current, total}}: any) => {
        this.setState({
          matchCount: total, 
          currentMatch: current,
        });
      },
      updateFindMatchesCount: ({current, total}: any) => {
        this.setState({
          matchCount: total, 
          currentMatch: current,
        });
      },
      supportsIntegratedFind: true,
    };
    pdfViewerApplicationAny.appConfig.toolbar.viewFind.classList.add("hidden");
    this.setState({
      pdfJsEventBus: pdfViewerApplicationAny.eventBus,
    });

    // This is safe since componentDidMount will
    // be called after one render.
    if (this.queryElement) {
      this.queryElement.focus();
      this.queryElement.select();
    }
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

  componentWillUnmount() {
    // TODO: fix this super hacky way to remove the green highlight on close.
    if (this.queryElement) {
      this.queryElement.value = '';
      this.dispatchEventToPdfJs("find");
    }
  }

  handleQueryChange() {
    /*
     * Code for dispatching events to the find controller from outside are based on
     * https://github.com/mozilla/pdf.js/blob/49f59eb627646ae9a6e166ee2e0ef2cac9390b4f/web/firefoxcom.js#L190-L200
     */
    this.dispatchEventToPdfJs("find");
  }

  handleNextButtonClick(e: React.SyntheticEvent) {
    this.dispatchEventToPdfJs("findagain");
    e.preventDefault();
  }

  handlePreviousButtonClick(e: React.SyntheticEvent) {
    this.dispatchEventToPdfJs("findagain", true);
    e.preventDefault();
  }

  closeFinder = (e: React.SyntheticEvent) => {
    this.props.setMode("hidden");
    e.preventDefault();
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

    if ((matchCount || 0) > MATCH_COUNT_LIMIT) {
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
          tabIndex={0}/>
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
        <div className="find-bar__close" onClick={this.closeFinder}>X</div>
      </div>
    );
  }

  queryElement: HTMLInputElement | null = null;
}

export default FindBarString;
