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
        <S2LogoMarkOnly />
        <span className="brandbar__app-title">
          <span className="brandbar__app-title__word1">SEMANTIC</span>&nbsp;
          <span className="brandbar__app-title__word2">READER</span>
        </span>
        <span className="brandbar__seperator"/>
        <span className="brandbar__app-subtitle">In collaboration with UC Berkeley</span>
      </div>
      <div className="brandbar__right"></div>
    </div>);

    return elControlsContainer
      ? ReactDOM.createPortal(portalValue, elControlsContainer)
      : null;
  }
}

function S2LogoMarkOnly() {
  return (
    <svg viewBox="0 0 181.89 150.81"
      aria-labelledby="logoTitle logoDesc"
      role="img"
      className="brandbar__s2-logo">
      <path className="yellow"
            d="M159.05,9c0.87,0,1.75,0.08,2.63,0.26c6.44,1.23,11.15,6.9,11.21,13.47v0.08 c-0.05,6.58-4.76,12.24-11.23,13.48c-0.86,0.17-1.74,0.25-2.61,0.25H34.22c2.03-4.19,3.15-8.84,3.18-13.64l0-0.03v-0.03V22.7v-0.03 l0-0.03c-0.03-4.79-1.15-9.44-3.18-13.64H159.05 M18.22,0c-0.32,0-1.69,0.05-2.03,0.89c-0.3,0.58-0.24,1.53,0.61,2.07 c6.88,3.9,11.54,11.27,11.6,19.74v0.14c-0.06,8.47-4.71,15.84-11.6,19.74c-0.85,0.54-0.91,1.49-0.61,2.07 c0.35,0.84,1.71,0.89,2.03,0.89c0.04,0,0.07,0,0.07,0h140.76c1.48,0,2.93-0.14,4.33-0.42c10.5-2.01,18.44-11.2,18.51-22.28V22.7 c-0.07-11.08-8.01-20.27-18.51-22.28c-1.4-0.27-2.85-0.42-4.33-0.42H18.29C18.29,0,18.27,0,18.22,0L18.22,0z"/>
      <path className="dark-blue"
            d="M159.05,114.28c0.87,0,1.75,0.08,2.63,0.26c6.44,1.23,11.15,6.9,11.21,13.47v0.08 c-0.05,6.58-4.76,12.24-11.23,13.48c-0.86,0.17-1.74,0.25-2.61,0.25H34.22c2.03-4.19,3.15-8.84,3.18-13.64l0-0.03v-0.03v-0.14 v-0.03l0-0.03c-0.03-4.79-1.15-9.44-3.18-13.64H159.05 M18.22,105.28c-0.32,0-1.69,0.05-2.03,0.89c-0.3,0.58-0.24,1.53,0.61,2.07 c6.88,3.9,11.54,11.27,11.6,19.74v0.14c-0.06,8.47-4.71,15.84-11.6,19.74c-0.85,0.54-0.91,1.49-0.61,2.07 c0.35,0.84,1.71,0.89,2.03,0.89c0.04,0,0.07,0,0.07,0h140.76c1.48,0,2.93-0.14,4.33-0.42c10.5-2.01,18.44-11.2,18.51-22.28v-0.14 c-0.07-11.08-8.01-20.27-18.51-22.28c-1.4-0.27-2.85-0.42-4.33-0.42H18.29C18.29,105.28,18.27,105.28,18.22,105.28L18.22,105.28z"/>
      <path className="blue"
            d="M163.94,61.52L163.94,61.52L163.94,61.52 M147.67,61.53c-2.03,4.19-3.15,8.84-3.18,13.64l0,0.03v0.03v0.14 v0.03l0,0.03c0.03,4.8,1.15,9.44,3.18,13.64H22.84c-0.87,0-1.75-0.08-2.63-0.26C13.76,87.57,9.05,81.91,9,75.33v-0.08 c0.05-6.58,4.76-12.24,11.23-13.48c0.86-0.17,1.74-0.25,2.61-0.25H147.67 M163.66,52.53c-0.04,0-0.07,0-0.07,0H22.84 c-1.48,0-2.93,0.14-4.33,0.42C8.01,54.96,0.07,64.15,0,75.22v0.14c0.07,11.08,8.01,20.27,18.51,22.28c1.4,0.27,2.85,0.42,4.33,0.42 H163.6c0,0,0.02,0,0.07,0c0.32,0,1.69-0.05,2.03-0.89c0.3-0.58,0.24-1.52-0.61-2.07c-6.88-3.89-11.54-11.27-11.6-19.74v-0.14 c0.06-8.47,4.71-15.84,11.6-19.74c0.85-0.54,0.91-1.49,0.61-2.07C165.35,52.58,163.98,52.53,163.66,52.53L163.66,52.53z"/>
    </svg>
  );
}

export default PdfjsBrandbar;
