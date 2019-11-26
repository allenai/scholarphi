import Button from "@material-ui/core/Button";
import React from "react";
import PaperClipping from "./PaperClipping";
import { ScholarReaderContext } from "./state";
import { Symbol } from "./types/api";

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
    const numPages = Math.ceil(this.props.results.length / this.props.pageSize);
    return (
      <div className="search-results">
        <ScholarReaderContext.Consumer>
          {({ setJumpSymbol }) => (
            <>
              {this.props.results.slice(startIndex, endIndex).map(symbol => (
                <div
                  className="search-results__result"
                  key={symbol.id}
                  onClick={() => setJumpSymbol(symbol)}
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
