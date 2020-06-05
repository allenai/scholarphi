import React from "react";
import { createPortal } from "react-dom";
import { PdfjsFindQueryWidget } from "./PdfjsFindQueryWidget";
import { ScholarReaderContext } from "./state";
import { SymbolFindQueryWidget } from "./SymbolFindQueryWidget";

interface FindBarProps {}

class FindBar extends React.PureComponent<FindBarProps> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  /*
   * The code for creating the match count message is based on 'PDFFindBar.updateResultsCount' in pdf.js:
   * https://github.com/mozilla/pdf.js/blob/49f59eb627646ae9a6e166ee2e0ef2cac9390b4f/web/pdf_find_bar.js#L152
   */
  createMatchCountMessage() {
    const MATCH_COUNT_LIMIT = 1000;
    const { findMatchIndex, findMatchCount } = this.context;
    if (findMatchIndex === null || findMatchCount === null) {
      return null;
    }

    if ((findMatchCount || 0) > MATCH_COUNT_LIMIT) {
      return `More than ${MATCH_COUNT_LIMIT} matches`;
    }
    return `${findMatchIndex} of ${findMatchCount} matches`;
  }

  wrapIndex(index: number, len: number) {
    return ((index % len) + len) % len;
  }

  /*
   * TODO(andrewhead): do we need to preventDefault or change 'selectSymbol'? I don't think so...
   */
  onClickNext() {
    const {
      findMode,
      findMatchIndex,
      findMatchCount,
      setState: setGlobalState,
    } = this.context;

    if (
      findMode === "symbol" &&
      findMatchIndex !== null &&
      findMatchCount !== null
    ) {
      setGlobalState({
        findMatchIndex: this.wrapIndex(findMatchIndex + 1, findMatchCount),
      });
    } else if (
      findMode === "pdfjs-builtin-find" &&
      this.pdfjsFindQueryWidget !== null
    ) {
      this.pdfjsFindQueryWidget.next();
    }
  }

  onClickPrevious() {
    const {
      findMode,
      findMatchIndex,
      findMatchCount,
      setState: setGlobalState,
    } = this.context;

    if (
      findMode === "symbol" &&
      findMatchIndex !== null &&
      findMatchCount !== null
    ) {
      setGlobalState({
        findMatchIndex: this.wrapIndex(findMatchIndex - 1, findMatchCount),
      });
    } else if (
      findMode === "pdfjs-builtin-find" &&
      this.pdfjsFindQueryWidget !== null
    ) {
      this.pdfjsFindQueryWidget.previous();
    }
  }

  close() {
    this.context.setState({
      isFindActive: false,
      findMode: null,
      findQuery: null,
      findMatchCount: null,
      findMatchIndex: null,
    });
    /*
     * TODO(andrewhead): Do we still need this e.preventDefault()?
     */
    // e.preventDefault();
  }

  render() {
    /*
     * TODO(andrewhead): is 'mainContainer' the right container? Maybe we need to add a dedicated container for the find bar.
     */
    const elFindBarContainer = document.getElementById("mainContainer");
    return (
      <ScholarReaderContext.Consumer>
        {({ findBarState, pdfViewerApplication, setState: setGlobalState }) => {
          if (elFindBarContainer) {
            createPortal(
              <div className="find-bar">
                {() => {
                  switch (findBarState) {
                    case "find-text": {
                      if (pdfViewerApplication === null) {
                        return null;
                      }
                      return (
                        <PdfjsFindQueryWidget
                          ref={(ref) => (this.pdfjsFindQueryWidget = ref)}
                          pdfViewerApplication={pdfViewerApplication}
                          onMatchIndexUpdated={(matchIndex) =>
                            setGlobalState({ findMatchIndex: matchIndex })
                          }
                          onMatchCountUpdated={(matchCount) =>
                            setGlobalState({ findMatchCount: matchCount })
                          }
                        />
                      );
                    }
                    case "find-symbol": {
                      return <SymbolFindQueryWidget />;
                    }
                  }
                }}
                <div className="find-bar__navigation">
                  <button
                    className="find-bar__navigation__previous"
                    onClick={this.onClickPrevious.bind(this)}
                  >
                    <span>Previous</span>
                  </button>
                  <button
                    className="find-bar__navigation__next"
                    onClick={this.onClickNext.bind(this)}
                  >
                    <span>Next</span>
                  </button>
                </div>
                <div className="find-bar__message">
                  <span className="find-bar__message__span">
                    {this.createMatchCountMessage()}
                  </span>
                </div>
                <div className="find-bar__close" onClick={this.close}>
                  X
                </div>
              </div>,
              elFindBarContainer
            );
          }
          return null;
        }}
      </ScholarReaderContext.Consumer>
    );
  }

  pdfjsFindQueryWidget: PdfjsFindQueryWidget | null = null;
}

export default FindBar;
