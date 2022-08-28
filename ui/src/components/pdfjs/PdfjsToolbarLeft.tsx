import React from "react";
import ReactDOM from "react-dom";

/**
 * Adds widgets to the pdf.js toolbar at the top of the application.
 */
class PdfjsToolbarLeft extends React.PureComponent {
  render() {
    const elControlsContainer = document.getElementById(
      "scholarReaderControlsLeft"
    );

    return elControlsContainer
      ? ReactDOM.createPortal(this.props.children, elControlsContainer)
      : null;
  }
}

export default PdfjsToolbarLeft;
