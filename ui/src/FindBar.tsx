import React from "react";

export class FindBar extends React.PureComponent {
  render() {
    return (
      <div className="find-bar">
        <input className="find-bar__query" placeholder="Find in document…" />
        <div className="find-bar__navigation">
          <button className="find-bar__navigation__previous">
            <span>Previous</span>
          </button>
          <button className="find-bar__navigation__next">
            <span>Next</span>
          </button>
        </div>
        <div className="find-bar__message">
          <span className="find-bar__message__span">k of N matches</span>
        </div>
      </div>
    );
  }
}
