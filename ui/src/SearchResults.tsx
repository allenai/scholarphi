import Button from "@material-ui/core/Button";
import React from "react";
import MathMl from "./MathMl";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import SymbolPreview from "./SymbolPreview";

interface SearchResultsProps {
  pageSize: number;
}

interface SearchResultState {
  pageNumber: number;
  filters: Filters;
}

type Filters = { [mathMl: string]: boolean };

export class SearchResults extends React.Component<
  SearchResultsProps,
  SearchResultState
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  constructor(props: SearchResultsProps) {
    super(props);
    this.state = { pageNumber: 0, filters: {} };
  }

  getFilteredSymbols(filters: Filters) {
    if (this.context.selectedSymbol === null) {
      return [];
    }
    const results = selectors.matchingSymbols(
      this.context.selectedSymbol,
      [...this.context.symbols],
      [...this.context.mathMl]
    );
    const symbolMathMls = selectors.symbolMathMls(results);
    const filteredMathMls = symbolMathMls.filter(mathMl => {
      return (
        this.state.filters[mathMl] === true ||
        this.state.filters[mathMl] === undefined
      );
    });
    return results.filter(symbol => {
      return filteredMathMls.indexOf(symbol.mathml) !== -1;
    });
  }

  setFilters(filters: Filters) {
    const filteredSymbols = this.getFilteredSymbols(filters);
    const numPages = Math.ceil(filteredSymbols.length / this.props.pageSize);
    const pageNumber = Math.max(
      Math.min(this.state.pageNumber, numPages - 1),
      0
    );
    this.setState({ filters, pageNumber });
  }

  render() {
    const startIndex = this.state.pageNumber * this.props.pageSize;
    const endIndex = (this.state.pageNumber + 1) * this.props.pageSize;
    return (
      <div className="search-results">
        <ScholarReaderContext.Consumer>
          {({ selectedSymbol, symbols, mathMl }) => {
            if (selectedSymbol === null) {
              return null;
            }
            const results = selectors.matchingSymbols(
              selectedSymbol,
              [...symbols],
              [...mathMl]
            );
            const symbolMathMls = selectors.symbolMathMls(results);
            const filtered = this.getFilteredSymbols(this.state.filters);
            const numPages = Math.ceil(filtered.length / this.props.pageSize);
            return (
              <>
                <div className="search-results__section">
                  Show me symbols that look like:
                  {symbolMathMls.map(mathMl => {
                    const variant =
                      this.state.filters[mathMl] === undefined ||
                      this.state.filters[mathMl] === true
                        ? "contained"
                        : "outlined";
                    return (
                      <div className="search-results__filter-button">
                        <Button
                          key={mathMl}
                          size="small"
                          variant={variant}
                          onClick={() => {
                            const filters = { ...this.state.filters };
                            if (
                              this.state.filters[mathMl] === undefined ||
                              this.state.filters[mathMl] === true
                            ) {
                              filters[mathMl] = false;
                            } else {
                              filters[mathMl] = true;
                            }
                            this.setFilters(filters);
                          }}
                        >
                          <MathMl mathMl={mathMl} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <div className="search-results__section">
                  {filtered.length} matching{" "}
                  {filtered.length === 1 ? "symbol" : "symbols"} found.
                </div>
                <div className="search-results__symbol-list search-results__section">
                  {filtered.slice(startIndex, endIndex).map(symbol => (
                    <div className="search-results__result" key={symbol.id}>
                      <SymbolPreview symbol={symbol} />
                    </div>
                  ))}
                </div>
                <div className="search-results__navigation search-results__section">
                  <Button
                    className="search-results__navigation__button"
                    variant="outlined"
                    disabled={this.state.pageNumber === 0}
                    onClick={() =>
                      this.setState({ pageNumber: this.state.pageNumber - 1 })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    className="search-results__navigation__button"
                    variant="outlined"
                    disabled={this.state.pageNumber === numPages - 1}
                    onClick={() =>
                      this.setState({ pageNumber: this.state.pageNumber + 1 })
                    }
                  >
                    Next
                  </Button>
                </div>
              </>
            );
          }}
        </ScholarReaderContext.Consumer>
      </div>
    );
  }
}

export default SearchResults;
