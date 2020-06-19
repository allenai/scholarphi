import React from "react";
import { EventBus, PDFViewerApplication } from "./types/pdfjs-viewer";

interface Props {
  query: string | null;
  onQueryChanged: (query: string | null) => void;
  onMatchCountChanged: (matchCount: number) => void;
  onMatchIndexChanged: (matchIndex: number) => void;
  pdfViewerApplication: PDFViewerApplication;
}

/**
 * Widget for searching for text. It relies entirely on pdf.js' 'find' functionality.
 * This component is partially controlled:
 *
 * * It does not own the 'query' value. Instead, this is stored outside of the component, and
 *   the component notifies its parent when the input field has been changed.
 * * The component controls the pdf.js state for finding text, providing a wrapper around
 *   the pdf.js 'find' functionality.
 */
export class PdfjsFindQueryWidget extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onInputChange = this.onInputChange.bind(this);
  }

  componentDidMount() {
    const { pdfViewerApplication } = this.props;

    /*
     * Patch the pdf.js application to support a custom find widget. 'find'
     * events are routed from the 'find controller' for pdf.js by defining the
     * 'updateFindControlState' and 'updateFindMatchesCount' function on the external services
     * property of the pdf.js application. For a discussion of our investigations of how to
     * integrate a custom find widget with pdf.js's find functionality, see
     * https://github.com/allenai/scholar-reader/issues/96
     */
    pdfViewerApplication.externalServices = {
      ...pdfViewerApplication.externalServices,
      updateFindControlState: ({ matchesCount: { current, total } }) => {
        this.props.onMatchCountChanged(total);
        this.props.onMatchIndexChanged(current - 1);
      },
      updateFindMatchesCount: ({ current, total }) => {
        this.props.onMatchCountChanged(total);
        this.props.onMatchIndexChanged(current - 1);
      },
      supportsIntegratedFind: true,
    };
    pdfViewerApplication.appConfig.toolbar.viewFind.classList.add("hidden");
    this.pdfjsEventBus = pdfViewerApplication.eventBus;

    /*
     * Whenever this component is created, focus the input field and select the text in it to
     * make it easy to edit. The parent component can force the input element to regain focus and
     * to get selected by changing the 'key' property, which will create a new version of this
     * component. See the justification for this design here:
     * https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
     *
     * 'this.inputElement' will have been initialized by the time 'componentDidMount' is called, as
     * 'componentDidMount' is only called after the first render.
     */
    if (this.inputElement !== null) {
      this.inputElement.focus();
      this.inputElement.select();
    }
  }

  /*
   * Whenever the query property changes (likely because the user has types in the 'find' box),
   * notify the pdf.js 'find controller' to trigger a new search.
   */
  componentDidUpdate(nextProps: Props) {
    if (this.props.query !== nextProps.query) {
      this.dispatchToPdfjs("find");
    }
  }

  /*
   * When this find widget closes, turn off the pdf.js match highlights.
   * TODO(andrewhead): make sure this works.
   */
  componentWillUnmount() {
    this.dispatchToPdfjs("findbarclose");
  }

  /*
   * Whenever the input changes, update the 'find' query.
   */
  onInputChange() {
    if (this.inputElement === null) {
      return;
    }
    const query =
      this.inputElement.value === "" ? null : this.inputElement.value;
    this.props.onQueryChanged(query);
  }

  next() {
    this.dispatchToPdfjs("findagain");
  }

  previous() {
    this.dispatchToPdfjs("findagain", true);
  }

  /*
   * Dispatch events for finding text to the pdf.js 'find controller'. Code for dispatching events
   * to the find controller from outside the pdf.js application is based on
   * https://github.com/mozilla/pdf.js/blob/49f59eb627646ae9a6e166ee2e0ef2cac9390b4f/web/firefoxcom.js#L190-L200
   */
  dispatchToPdfjs(eventName: string, findPrevious?: boolean) {
    const { query } = this.props;
    if (query === null) {
      return;
    }
    if (this.pdfjsEventBus !== undefined) {
      this.pdfjsEventBus.dispatch("find", {
        source: window,
        type: eventName.substring("find".length),
        query,
        phraseSearch: true,
        caseSensitive: false,
        entireWord: false,
        highlightAll: false,
        findPrevious: findPrevious || false,
      });
    }
  }

  render() {
    return (
      <input
        className="find-bar__query"
        ref={(ref) => {
          this.inputElement = ref;
        }}
        onInput={this.onInputChange}
        defaultValue={this.props.query || ""}
        placeholder="Find in document…"
        tabIndex={0}
      />
    );
  }

  inputElement: HTMLInputElement | null = null;

  /**
   * Event bus for the pdf.js application. This event bus is the how this component
   * communicates with the 'find controller' in pdf.js. This component tells the event bus when to
   * perform a 'find' action, and listens for the find controller to compute how many matches are
   * in the document, and which match is currently selected.
   */
  pdfjsEventBus?: EventBus;
}

export default PdfjsFindQueryWidget;
