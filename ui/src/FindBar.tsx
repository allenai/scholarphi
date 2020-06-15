import React from "react";
import ReactDOM from "react-dom";
import { PdfjsFindQueryWidget } from "./PdfjsFindQueryWidget";
import { ScholarReaderContext } from "./state";
import { SymbolFindQueryWidget } from "./SymbolFindQueryWidget";

class FindBar extends React.PureComponent {
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

    /*
     * The default behavior when the find widget is controlled is to change which entity is
     * selected as the 'match' and advance the global match index.
     */
    if (findMode !== "pdfjs-builtin-find") {
      if (findMatchIndex !== null && findMatchCount !== null) {
        setGlobalState({
          findMatchIndex: this.wrapIndex(findMatchIndex + 1, findMatchCount),
        });
      }
    }

    /*
     * If the find widget is for the pdf.js built-in find functionality, then instead pdf.js needs
     * to be notified that the user has requested that the next match gets selected.
     */
    if (
      findMode === "pdfjs-builtin-find" &&
      this.pdfjsFindQueryWidget !== null
    ) {
      this.pdfjsFindQueryWidget.next();
    }
  }

  /*
   * See 'onClickNext' for implementation notes.
   */
  onClickPrevious() {
    const {
      findMode,
      findMatchIndex,
      findMatchCount,
      setState: setGlobalState,
    } = this.context;

    if (findMode !== "pdfjs-builtin-find") {
      if (findMatchIndex !== null && findMatchCount !== null) {
        setGlobalState({
          findMatchIndex: this.wrapIndex(findMatchIndex - 1, findMatchCount),
        });
      }
    }

    if (
      findMode === "pdfjs-builtin-find" &&
      this.pdfjsFindQueryWidget !== null
    ) {
      this.pdfjsFindQueryWidget.previous();
    }
  }

  close() {
    // TODO(andrewhead): Do we still need this e.preventDefault()?
    this.context.setState({
      isFindActive: false,
      findActivatedTimeMs: null,
      findMode: null,
      findQuery: null,
      findMatchCount: null,
      findMatchIndex: null,
    });
  }

  render() {
    /*
     * TODO(andrewhead): is 'mainContainer' the right container? Maybe we need to add a dedicated container for the find bar.
     */
    const elFindBarContainer = document.getElementById("mainContainer");
    return (
      <ScholarReaderContext.Consumer>
        {({
          findMode,
          findActivatedTimeMs,
          findQuery,
          pdfViewerApplication,
          setState: setGlobalState,
        }) => {
          if (elFindBarContainer && findMode !== null) {
            return ReactDOM.createPortal(
              <div className="find-bar">
                <div className="find-bar__query">
                  {
                    /* Custom find widgets, depending on the type of search being performed. */
                    (() => {
                      switch (findMode) {
                        case "pdfjs-builtin-find": {
                          if (
                            pdfViewerApplication === null ||
                            findActivatedTimeMs === null
                          ) {
                            return null;
                          }
                          return (
                            /*
                             * Key this widget with the time that the find event was activated
                             * (i.e., when 'Ctrl+F' was typed). This regenerates the widgets whenever
                             * a new 'find' action is started, which will select and focus the text
                             * in the search widget. See why we use key to regenerate component here:
                             * https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
                             */
                            <PdfjsFindQueryWidget
                              key={findActivatedTimeMs}
                              ref={(ref) => (this.pdfjsFindQueryWidget = ref)}
                              pdfViewerApplication={pdfViewerApplication}
                              query={findQuery as string | null}
                              onQueryChanged={(query) =>
                                setGlobalState({
                                  findQuery: query,
                                  findMatchIndex: null,
                                  findMatchCount: null,
                                })
                              }
                              onMatchIndexChanged={(matchIndex) =>
                                setGlobalState({ findMatchIndex: matchIndex })
                              }
                              onMatchCountChanged={(matchCount) =>
                                setGlobalState({ findMatchCount: matchCount })
                              }
                            />
                          );
                        }
                        case "symbol": {
                          if (findActivatedTimeMs === null) {
                            return;
                          }
                          return (
                            /*
                             * See note above for the 'PdfjsFindQueryWidget' for why we use a key to
                             * regenerate this find widget when a new 'find' request is made.
                             */
                            <SymbolFindQueryWidget key={findActivatedTimeMs} />
                          );
                        }
                        default:
                          return;
                      }
                    })()
                  }
                </div>
                {/* Common components for finding: next, back, and close. */}
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
                <div
                  className="find-bar__close"
                  onClick={this.close.bind(this)}
                >
                  X
                </div>
              </div>,
              elFindBarContainer
            );
          }
        }}
      </ScholarReaderContext.Consumer>
    );
  }

  pdfjsFindQueryWidget: PdfjsFindQueryWidget | null = null;
}

export default FindBar;
