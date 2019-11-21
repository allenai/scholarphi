import Button from "@material-ui/core/Button";
import React from "react";
import PaperClipping from "./PaperClipping";
import { ScholarReaderContext } from "./state";
import { Symbol } from "./types/api";
import { PDFViewer } from "./types/pdfjs-viewer";

function scrollToSymbol(pdfViewer: PDFViewer, symbol: Symbol) {
  /*
   * Based roughly on the scroll offsets used for pdf.js "find" functionality:
   * https://github.com/mozilla/pdf.js/blob/16ae7c6960c1296370c1600312f283a68e82b137/web/pdf_find_controller.js#L190-L191
   * TODO(andrewhead): this offset should be in viewport coordinates, not PDF coordinates.
   */
  const SCROLL_OFFSET_X = -400;
  const SCROLL_OFFSET_Y = +100;

  const box = symbol.bounding_box;
  pdfViewer.scrollPageIntoView({
    pageNumber: box.page + 1,
    destArray: [
      undefined,
      { name: "XYZ" },
      box.left + SCROLL_OFFSET_X,
      box.top + SCROLL_OFFSET_Y
    ]
  });
}

interface SearchResultsProps {
  results: Symbol[];
  pageSize: number;
}

interface SearchResultState {
  pageNumber: number;
}

export class SearchResults extends React.Component<
  SearchResultsProps,
  SearchResultState
> {
  constructor(props: SearchResultsProps) {
    super(props);
    this.state = { pageNumber: 0 };
  }

  render() {
    const startIndex = this.state.pageNumber * this.props.pageSize;
    const endIndex = (this.state.pageNumber + 1) * this.props.pageSize;
    const numPages = Math.floor(
      this.props.results.length / this.props.pageSize
    );
    return (
      <div className="search-results">
        <ScholarReaderContext.Consumer>
          {({ pdfViewer }) => (
            <>
              {this.props.results.slice(startIndex, endIndex).map(symbol => (
                <div
                  className="search-results__result"
                  key={symbol.id}
                  onClick={() =>
                    pdfViewer !== null && scrollToSymbol(pdfViewer, symbol)
                  }
                >
                  <PaperClipping
                    pageNumber={symbol.bounding_box.page + 1}
                    highlightBoxes={[symbol.bounding_box]}
                  />
                </div>
              ))}
            </>
          )}
        </ScholarReaderContext.Consumer>
        <Button
          disabled={this.state.pageNumber === 0}
          onClick={() =>
            this.setState({ pageNumber: this.state.pageNumber - 1 })
          }
        >
          Previous
        </Button>
        <Button
          disabled={this.state.pageNumber === numPages - 1}
          onClick={() =>
            this.setState({ pageNumber: this.state.pageNumber + 1 })
          }
        >
          Next
        </Button>
      </div>
    );
  }
}

export default SearchResults;
