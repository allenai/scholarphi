import { getRemoteLogger } from "../../logging";
import {
  EventBus,
  PdfJsFindControllerState,
  PDFViewerApplication,
} from "../../types/pdfjs-viewer";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import React from "react";

const logger = getRemoteLogger();

interface Props {
  query: string | null;
  onQueryChanged: (query: string | null) => void;
  onMatchCountChanged: (matchCount: number) => void;
  onMatchIndexChanged: (matchIndex: number) => void;
  pdfViewerApplication: PDFViewerApplication;
}

interface State {
  matchCase: boolean;
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
export class PdfjsFindQueryWidget extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      matchCase: false,
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onMatchCaseChange = this.onMatchCaseChange.bind(this);
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
      updateFindControlState: ({
        result,
        matchesCount: { current, total },
      }) => {
        this.pdfjsFindControllerState = result;
        if (result === PdfJsFindControllerState.NOT_FOUND) {
          this.props.onMatchCountChanged(0);
          this.props.onMatchIndexChanged(0);
        } else if (
          result === PdfJsFindControllerState.WRAPPED ||
          result === PdfJsFindControllerState.FOUND
        ) {
          this.props.onMatchCountChanged(total);
          this.props.onMatchIndexChanged(current - 1);
        }
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
  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.props.query !== prevProps.query ||
      this.state.matchCase !== prevState.matchCase
    ) {
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
    logger.log("debug", "find-text-query-changed", {
      previous: this.props.query,
      next: this.inputElement.value,
    });
    const query =
      this.inputElement.value === "" ? null : this.inputElement.value;
    this.props.onQueryChanged(query);
  }

  onMatchCaseChange(event: React.ChangeEvent<HTMLInputElement>) {
    logger.log("debug", "find-text-match-case-toggled", {
      checked: event.target.checked,
    });
    this.setState({ matchCase: event.target.checked });
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
      if (eventName === "findbarclose") {
        this.pdfjsEventBus.dispatch(eventName, { source: window });
      } else {
        this.pdfjsEventBus.dispatch("find", {
          source: window,
          type: eventName.substring("find".length),
          query,
          phraseSearch: true,
          caseSensitive: this.state.matchCase,
          entireWord: false,
          highlightAll: true,
          findPrevious: findPrevious || false,
        });
      }
    }
  }

  render() {
    return (
      <>
        <TextField
          className="find-bar__query__input"
          inputRef={(ref) => {
            this.inputElement = ref;
          }}
          onInput={this.onInputChange}
          defaultValue={this.props.query || ""}
          placeholder="Find in document…"
          tabIndex={0}
          autoFocus
        />
        <FormControlLabel
          className="find-bar__query__flag"
          control={
            <Switch
              checked={this.state.matchCase}
              color="primary"
              size="small"
              onChange={this.onMatchCaseChange}
            />
          }
          label="Match case"
        />
      </>
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

  pdfjsFindControllerState?: PdfJsFindControllerState;
}

export default PdfjsFindQueryWidget;
