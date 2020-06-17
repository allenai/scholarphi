import React from "react";
import * as uiUtils from "./ui-utils";

interface Props {
  /*
   * appContainer must be capable of receiving 'keydown' and 'keyup' events. An arbitrary 'div'
   * can receive these events if its 'tabindex' property is set. It's recommended that the
   * 'document.body' element is provided for this property.
   */
  appContainer: HTMLElement;
  handleHideAnnotations: () => void;
  handleShowAnnotations: () => void;
  handleCloseDrawer: () => void;
  handleStartTextSearch: () => void;
  handleTerminateSearch: () => void;
  handleDeselectSelection: () => void;
  handleToggleUserAnnotationMode: () => void;
}

/**
 * See the documentation for ViewerOverlay for a justification of why this overlay is an empty
 * component that handles events rather than a transparent element.
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

  componentWillUpdate(prevProps: Props, props: Props) {
    if (prevProps.appContainer !== props.appContainer) {
      this.removeEventListeners(prevProps.appContainer);
      this.addEventListeners(props.appContainer);
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
      this.props.handleToggleUserAnnotationMode();
    }
    if (event.keyCode === 18 || event.key === "Alt") {
      this.props.handleShowAnnotations();
    }
  }

  render() {
    return null;
  }
}

export default AppOverlay;
