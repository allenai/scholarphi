import React from "react";
import ReactDOM from "react-dom";
import EntityCreationTypeSelect from "./EntityCreationTypeSelect";
import FeedbackButton from "./FeedbackButton";
import { KnownEntityType, PaperId } from "./state";
import * as uiUtils from "./ui-utils";

interface Props {
  /*
   * appContainer must be capable of receiving 'keydown' and 'keyup' events. An arbitrary 'div'
   * can receive these events if its 'tabindex' property is set. It's recommended that the
   * 'document.body' element is provided for this property.
   */
  appContainer: HTMLElement;
  paperId?: PaperId;
  entityCreationEnabled: boolean;
  entityCreationType: KnownEntityType;
  handleHideAnnotations: () => void;
  handleShowAnnotations: () => void;
  handleCloseDrawer: () => void;
  handleStartTextSearch: () => void;
  handleTerminateSearch: () => void;
  handleDeselectSelection: () => void;
  handleToggleEntityCreationMode: () => void;
  handleSelectEntityCreationType: (type: KnownEntityType) => void;
}

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
  }

  removeEventListeners(element: HTMLElement) {
    element.removeEventListener("keydown", this.onKeyDown);
    element.removeEventListener("keyup", this.onKeyUp);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 18 || event.key === "Alt") {
      this.props.handleHideAnnotations();
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
    if (event.ctrlKey && event.shiftKey && event.key !== "a") {
      this.props.handleToggleEntityCreationMode();
    }
    if (event.keyCode === 18 || event.key === "Alt") {
      this.props.handleShowAnnotations();
    }
  }

  render() {
    const elFeedbackContainer = document.getElementById(
      "scholarReaderGlobalFeedbackButton"
    );
    const elEntityCreationTypeContainer = document.getElementById(
      "scholarReaderAnnotationTypeSelect"
    );

    return (
      <>
        {/* Add widgets to the toolbar */}
        {elFeedbackContainer
          ? ReactDOM.createPortal(
              <FeedbackButton paperId={this.props.paperId} variant="toolbar" />,
              elFeedbackContainer
            )
          : null}
        {this.props.entityCreationEnabled && elEntityCreationTypeContainer
          ? ReactDOM.createPortal(
              <EntityCreationTypeSelect
                entityType={this.props.entityCreationType}
                handleSelectType={this.props.handleSelectEntityCreationType}
              />,
              elEntityCreationTypeContainer
            )
          : null}
      </>
    );
  }
}

export default AppOverlay;
