import React from "react";
import { convertToAnnotationId } from './selectors/annotation'
import { EventBus } from "./types/pdfjs-viewer";
import { ScholarReaderContext } from "./state";
import { BoundingBox } from "./types/api";

interface FindBarProps {
  mappingToBounds: Map<String, BoundingBox>;
  matches: string[];
  selectedSymbol: string;
}

interface FindBarState {
  currentMatch: number | null;
  matchCount: number | null;
  mode: "hidden" | "text-search" | "symbol-search",
  /**
   * Event bus for the pdf.js application. The logic for performing text search within the PDF is
   * provided by pdf.js. This event bus is needed for communicating with the pdf.js code.
   */
  pdfJsEventBus?: EventBus;
}

const initialState = {
  currentMatch: null,
  matchCount: null,
  mode: 'hidden',
}

export class FindBar extends React.PureComponent<FindBarProps, FindBarState> {
  state = initialState;
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  /**
   * This is considered an anti pattern in React (https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html),
   * unfortunately since we are using this component for both string search (which does update match count without props) and symbol search
   * we have to derive the match count and current match from the props. In the future we should probably divide these
   * into separate components.
   */
  UNSAFE_componentWillReceiveProps(nextProps: FindBarProps) {
    if (nextProps.selectedSymbol !== null) {
      this.setState({
        currentMatch: nextProps.matches.indexOf(nextProps.selectedSymbol) + 1,
        matchCount: nextProps.matches.length,
        mode: 'symbol-search',
      })
     } else if (this.state.mode === 'symbol-search') {
       this.setState(initialState);
     }
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
      this.setState({
        ...initialState,
        mode: 'text-search'
      });
      this.unselectSymbol();
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

  wrapIndex(index: number, len: number) {
    return (index % len + len) % len;
  }

  selectSymbol(id: string, boxId: string) {
    this.context.setSelectedEntity(id, "symbol");
    this.context.setSelectedAnnotationId(convertToAnnotationId(id));
    this.context.setSelectedAnnotationSpanId(boxId);
  }

  deselectSymbol() {
    this.context.setSelectedEntity(null, null);
    this.context.setSelectedAnnotationId(null);
    this.context.setSelectedAnnotationSpanId(null);
  }

  moveToNextSymbol(movement: number) {
    const { matches, mappingToBounds, selectedSymbol } = this.props;
    const newEntityId = matches[
      this.wrapIndex(matches.indexOf(selectedSymbol || '') + movement, matches.length)
    ];
   
    const newBoxId = mappingToBounds.has(newEntityId) ? mappingToBounds.get(newEntityId).id : '';
    this.selectSymbol(newEntityId, newBoxId);
  }

  handleNextButtonClick(e) {
    if (this.state.mode === 'symbol-search') {
      this.moveToNextSymbol(1);
    } else {
      this.dispatchEventToPdfJs("findagain");
    }
    e.preventDefault();
  }

  handlePreviousButtonClick(e) {
    if (this.state.mode === 'symbol-search') {
      this.moveToNextSymbol(-1);
    } else {
      this.dispatchEventToPdfJs("findagain", true);
    }
    e.preventDefault();
  }

  closeFinder = (e) => {
    this.setState(initialState);
    this.unselectSymbol();
    // TODO: fix this super hacky way to remove the green highlight on close.
    if (this.queryElement) {
      this.queryElement.value = '';
      this.dispatchEventToPdfJs("find");
    }
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
    if (this.state.mode === 'hidden') {
      return <div></div>
    }
    return (
      <div className="find-bar">
        {this.state.mode === 'text-search' && 
          <input
            className="find-bar__query"
            placeholder="Find in document…"
            ref={this.initializeQueryElement.bind(this)}
            tabIndex={0}/>
         }
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

export default FindBar;
