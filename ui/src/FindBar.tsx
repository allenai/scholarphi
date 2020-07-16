import Card from "@material-ui/core/Card";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import classNames from "classnames";
import React from "react";
import { PdfjsFindQueryWidget } from "./PdfjsFindQueryWidget";
import { SymbolFilters } from "./state";
import { SymbolFindQueryWidget } from "./SymbolFindQueryWidget";
import { PDFViewerApplication } from "./types/pdfjs-viewer";

export type FindMode = null | "pdfjs-builtin-find" | "symbol";
export type FindQuery = null | string | SymbolFilters;
export interface SymbolFilter {
  key: "exact-match" | "partial-match";
  active?: boolean;
}

interface Props {
  className?: string;
  pdfViewerApplication: PDFViewerApplication;
  mode: FindMode;
  query: FindQuery;
  matchIndex: number | null;
  matchCount: number | null;
  handleClose: () => void;
  handleChangeMatchIndex: (matchIndex: number | null) => void;
  handleChangeMatchCount: (matchCount: number | null) => void;
  handleChangeQuery: (query: FindQuery | null) => void;
}

class FindBar extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onPdfjsQueryChanged = this.onPdfjsQueryChanged.bind(this);
    this.onClickNext = this.onClickNext.bind(this);
    this.onClickPrevious = this.onClickPrevious.bind(this);
    this.close = this.close.bind(this);
  }

  /*
   * The code for creating the match count message is based on 'PDFFindBar.updateResultsCount' in pdf.js:
   * https://github.com/mozilla/pdf.js/blob/49f59eb627646ae9a6e166ee2e0ef2cac9390b4f/web/pdf_find_bar.js#L152
   */
  createMatchCountMessage() {
    const MATCH_COUNT_LIMIT = 1000;
    const { query, matchIndex, matchCount } = this.props;
    if (query === null || matchIndex === null || matchCount === null) {
      return null;
    }

    if (matchCount === 0) {
      return "No matches found";
    }
    if ((matchCount || 0) > MATCH_COUNT_LIMIT) {
      return `More than ${MATCH_COUNT_LIMIT} matches`;
    }
    return `${matchIndex + 1} of ${matchCount} matches`;
  }

  wrapIndex(index: number, len: number) {
    return ((index % len) + len) % len;
  }

  onClickNext() {
    const { mode, matchIndex, matchCount, handleChangeMatchIndex } = this.props;

    /*
     * The default behavior when the find widget is controlled is to change which entity is
     * selected as the 'match' and advance the global match index.
     */
    if (mode !== "pdfjs-builtin-find") {
      if (matchIndex !== null && matchCount !== null) {
        handleChangeMatchIndex(this.wrapIndex(matchIndex + 1, matchCount));
      }
    }

    /*
     * If the find widget is for the pdf.js built-in find functionality, then instead pdf.js needs
     * to be notified that the user has requested that the next match gets selected.
     */
    if (mode === "pdfjs-builtin-find" && this.pdfjsFindQueryWidget !== null) {
      this.pdfjsFindQueryWidget.next();
    }
  }

  /*
   * See 'onClickNext' for implementation notes.
   */
  onClickPrevious() {
    const { mode, matchIndex, matchCount, handleChangeMatchIndex } = this.props;

    if (mode !== "pdfjs-builtin-find") {
      if (matchIndex !== null && matchCount !== null) {
        handleChangeMatchIndex(this.wrapIndex(matchIndex - 1, matchCount));
      }
    }

    if (mode === "pdfjs-builtin-find" && this.pdfjsFindQueryWidget !== null) {
      this.pdfjsFindQueryWidget.previous();
    }
  }

  onPdfjsQueryChanged(query: string | null) {
    this.props.handleChangeQuery(query);
    /*
     * If the query has changed, a new search has been submitted to 'pdf.js' for processing. Set
     * the match index and count to 'null' while they get recomputed.
     */
    this.props.handleChangeMatchIndex(null);
    this.props.handleChangeMatchCount(null);
  }

  close() {
    this.props.handleClose();
  }

  render() {
    const {
      matchCount,
      matchIndex,
      mode,
      pdfViewerApplication,
      query,
    } = this.props;

    if (mode !== null) {
      return (
        <Card
          className={classNames("find-bar", this.props.className)}
          raised={true}
        >
          <div className="find-bar__query">
            {
              /* Custom find widgets, depending on the type of search being performed. */
              (() => {
                switch (mode) {
                  case "pdfjs-builtin-find": {
                    if (pdfViewerApplication === null) {
                      return null;
                    }
                    return (
                      <PdfjsFindQueryWidget
                        ref={(ref) => (this.pdfjsFindQueryWidget = ref)}
                        pdfViewerApplication={pdfViewerApplication}
                        query={query as string | null}
                        onQueryChanged={this.onPdfjsQueryChanged}
                        onMatchIndexChanged={this.props.handleChangeMatchIndex}
                        onMatchCountChanged={this.props.handleChangeMatchCount}
                      />
                    );
                  }
                  case "symbol": {
                    return (
                      <SymbolFindQueryWidget
                        filters={query as SymbolFilters}
                        handleFilterChange={this.props.handleChangeQuery}
                      />
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
            <IconButton
              disabled={matchCount === null || matchCount === 0}
              onClick={this.onClickPrevious}
              size="small"
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton
              disabled={matchCount === null || matchCount === 0}
              onClick={this.onClickNext}
              size="small"
            >
              <NavigateNextIcon />
            </IconButton>
          </div>
          {query !== null ? (
            <div className="find-bar__message">
              <span className="find-bar__message__span">
                {matchCount !== null && matchIndex !== null ? (
                  this.createMatchCountMessage()
                ) : (
                  <CircularProgress
                    className="find-bar__progress"
                    size={"1rem"}
                  />
                )}
              </span>
            </div>
          ) : null}
          <IconButton onClick={this.close} size="small">
            <CloseIcon />
          </IconButton>
        </Card>
      );
    }
  }

  pdfjsFindQueryWidget: PdfjsFindQueryWidget | null = null;
}

export default FindBar;
