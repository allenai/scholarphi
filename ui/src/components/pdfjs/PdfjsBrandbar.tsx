import React from "react";
import ReactDOM from "react-dom";

/**
 * Adds widgets to the pdf.js toolbar at the top of the application.
 */
class PdfjsBrandbar extends React.PureComponent {
  render() {
    const elControlsContainer = document.getElementById(
      "readerBrandbar"
    );

    const portalValue = (<div className="brandbar">
      <div className="brandbar__left">
        Semantic Reader | In collaboration with UC Berkeley
      </div>
      <div className="brandbar__right">About</div>
    </div>);

    return elControlsContainer
      ? ReactDOM.createPortal(portalValue, elControlsContainer)
      : null;
  }
}

export default PdfjsBrandbar;
