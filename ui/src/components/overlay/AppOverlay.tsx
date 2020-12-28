import Snackbar from "@material-ui/core/Snackbar";
import React from "react";
import { getRemoteLogger } from "../../logging";
import * as uiUtils from "../../utils/ui";

const logger = getRemoteLogger();

interface Props {
  /*
   * appContainer must be capable of receiving 'keydown' and 'keyup' events. An arbitrary 'div'
   * can receive these events if its 'tabindex' property is set. It's recommended that the
   * 'document.body' element is provided for this property.
   */
  appContainer: HTMLElement;
  snackbarMode: SnackbarMode;
  snackbarActivationTimeMs: number | null;
  snackbarMessage: string | null;
  highlightEntities: boolean;
  rapidAnnotationEnabled: boolean;
  handleToggleControlPanelShowing: () => void;
  handleCloseSnackbar: () => void;
  handleCloseDrawer: () => void;
  handleStartTextSearch: () => void;
  handleTerminateSearch: () => void;
  handleSetMultiselectEnabled: (enabled: boolean) => void;
}

export type SnackbarMode = "open" | "closed";

/**
 * An overlay that overlays widgets over the container for the entire app, and which captures click
 * and keyboard events fired from anywhere within this app container. This is especially useful for
 * handling keypresses ment to trigger mode switches from anywhere in the app.
 *
 * See the documentation for ViewerOverlay for a justification of why this overlay does not use a
 * transparent full-screen HTML element to capture input events.
 */
class AppOverlay extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPopState = this.onPopState.bind(this);
    this.onCloseSnackbar = this.onCloseSnackbar.bind(this);
  }

  componentDidMount() {
    this.addEventListeners(this.props.appContainer);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.appContainer !== this.props.appContainer) {
      this.removeEventListeners(prevProps.appContainer);
      this.addEventListeners(this.props.appContainer);
    }
  }

  componentWillUnmount() {
    this.removeEventListeners(this.props.appContainer);
  }

  addEventListeners(element: HTMLElement) {
    /*
     * It's possible to listen for key events on the PDF viewer container as the pdf.js source code
     * has allowed the container to have focus by setting 'tabindex=0'. We may need to check to
     * make sure that future versions of the pdf.js application still allow the app container
     * (e.g., document.body) to receive focus. Otherwise, key events will appear to do nothing.
     */
    element.addEventListener("keydown", this.onKeyDown);
    element.addEventListener("keyup", this.onKeyUp);
    /*
     * Listen for clicks on the 'back' button on the global window event.
     */
    window.addEventListener("popstate", this.onPopState);
  }

  removeEventListeners(element: HTMLElement) {
    element.removeEventListener("keydown", this.onKeyDown);
    element.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("popstate", this.onPopState);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 16 || event.key === "Shift") {
      this.props.handleSetMultiselectEnabled(true);
    }
    /*
     * This code for listening for Ctrl+F and for opening the find bar is based on the analogous
     * code in the pdf.js project:
     * https://github.com/mozilla/pdf.js/blob/49f59eb627646ae9a6e166ee2e0ef2cac9390b4f/web/app.js#L2503
     * Note that the find bar should be opened on a key-down event instead of a key-up event, because the
     * Chrome browser listens for a key-down event to open its built-in find-bar. To prevent the
     * Chrome find-bar from opening, the key-down event needs to be intercepted, and its default
     * behavior needs to be prevents.
     */
    if ((event.ctrlKey || event.metaKey) && event.keyCode === 70) {
      this.props.handleStartTextSearch();
      event.preventDefault();
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (uiUtils.isKeypressEscape(event)) {
      this.props.handleTerminateSearch();
      this.props.handleCloseDrawer();
    }
    if (event.ctrlKey && event.shiftKey && event.key === "C") {
      this.props.handleToggleControlPanelShowing();
    }
    if (event.keyCode === 16 || event.key === "Shift") {
      this.props.handleSetMultiselectEnabled(false);
    }
  }

  onPopState() {
    logger.log("debug", "pop-history-state");
  }

  onCloseSnackbar(_: any, reason: string) {
    /*
     * Only dismiss the snack bar when it has shown for the requested duration. Don't hide it
     * on clickaway, as that absorbs a click the user probably meant for some other target.
     */
    if (reason === "timeout") {
      this.props.handleCloseSnackbar();
    }
  }

  render() {
    const {
      highlightEntities,
      rapidAnnotationEnabled,
      appContainer,
    } = this.props;
    if (highlightEntities) {
      if (!appContainer.classList.contains("highlight-entities")) {
        appContainer.classList.add("highlight-entities");
      }
    } else {
      if (appContainer.classList.contains("highlight-entities")) {
        appContainer.classList.remove("highlight-entities");
      }
    }

    if (rapidAnnotationEnabled) {
      if (!appContainer.classList.contains("rapid-annotation")) {
        appContainer.classList.add("rapid-annotation");
      }
    } else {
      if (appContainer.classList.contains("rapid-annotation")) {
        appContainer.classList.remove("rapid-annotation");
      }
    }

    return (
      <>
        {/*
         * Add other overlays that are appropriate to show over the entire app. For overlays that
         * should be shown over the PDF viewer, add them to 'ViewerOverlay'.
         */}
        {this.props.snackbarMessage !== null &&
        this.props.snackbarActivationTimeMs !== null ? (
          <Snackbar
            key={this.props.snackbarActivationTimeMs}
            open={this.props.snackbarMode === "open"}
            message={this.props.snackbarMessage}
            anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
            /*
             * Set to Snackbar showing time to recommended lower limit from Material design
             * guidelines. See https://material.io/components/snackbars#behavior
             */
            autoHideDuration={4000}
            onClose={this.onCloseSnackbar}
          ></Snackbar>
        ) : null}
      </>
    );
  }
}

export default AppOverlay;
