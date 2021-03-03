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
    <svg
      viewBox="0 0 83.2 60"
      aria-labelledby="logoTitle logoDesc"
      role="img"
      className="brandbar__s2-logo">
      <title id="logoTitle">Semantic Scholar</title>
      <desc id="logoDesc">Semantic Scholar's Logo</desc>
      <g className="brandbar__s2-logo__mark">
        <path
          className="brandbar__s2-logo__checkmark"
          d="M83.2,18.3c-2.9,1.8-5,2.9-7.4,4.3c-14.4,8.7-28.3,18.4-39,31.1L31.6,60L15.8,34.8c3.5,2.8,12.4,10.7,16,12.5 l11.6-8.8C51.5,32.8,74.4,20.4,83.2,18.3z"
        />
        <path
          className="brandbar__s2-logo__paper-one"
          d="M27.9,41.1c1.2,1,2.4,1.9,3.4,2.6c2.6-12.7,0.4-26.4-6.5-38.3c11.7-0.2,23.4-0.3,35-0.5 c2.6,5.8,4.1,12,4.5,18.4c1-0.5,2-1,3.1-1.5C66.9,15.2,65.1,8.2,61.6,0C45.6,0,29.7,0,13.7,0C24.1,12.3,28.8,27.2,27.9,41.1z"
        />
        <path
          className="brandbar__s2-logo__paper-two"
          d="M25.8,39.4c0.3,0.3,0.7,0.5,1,0.8c-0.5-11.8-4.9-23.9-13.3-34.3c-2.5,0-5,0-7.5,0 C16.7,15.8,23.3,27.8,25.8,39.4z"
        />
        <path
          className="brandbar__s2-logo__paper-three"
          d="M23.2,37.1c0.4,0.3,0.7,0.6,1.1,0.9c-3.1-8.7-8.6-17.4-16.4-24.9c-2.6,0-5.2,0-7.9,0 C10,20.3,17.8,28.7,23.2,37.1z"
        />
      </g>
    </svg>
  );
}

export default PdfjsBrandbar;
