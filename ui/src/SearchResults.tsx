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

type Filters = { [mathMlId: string]: boolean };

export class SearchResults extends React.PureComponent<
  SearchResultsProps,
  SearchResultState
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  constructor(props: SearchResultsProps) {
    super(props);
    /*
     * TODO(andrewhead): MathML filters should be reset for every search. Make sure they are.
     */
    this.state = { pageNumber: 0, filters: {} };
  }

  setFilters(filters: Filters) {
    const filteredSymbolIds = this.getFilteredSymbolIds(filters);
    const numPages = Math.ceil(filteredSymbolIds.length / this.props.pageSize);
    const pageNumber = Math.max(
      Math.min(this.state.pageNumber, numPages - 1),
      0
    );
    this.setState({ filters, pageNumber });
  }

  render() {
    const startSymbolIndex = this.state.pageNumber * this.props.pageSize;
    const endSymbolIndex = (this.state.pageNumber + 1) * this.props.pageSize;
    return (
      <div className="search-results">
        <ScholarReaderContext.Consumer>
          {({ selectedEntityType, selectedEntityId, symbols, mathMls }) => {
            if (
              symbols === null ||
              mathMls === null ||
              selectedEntityType !== "symbol" ||
              selectedEntityId === null
            ) {
              return null;
            }

            const matchingSymbolIds = selectors.matchingSymbols(
              selectedEntityId,
              symbols,
              mathMls
            );

            const symbolMathMlIds = selectors.symbolMathMlIds(
              matchingSymbolIds,
              symbols,
              mathMls
            );

            const filteredSymbolIds = this.getFilteredSymbolIds(
              this.state.filters
            );
            const symbolIds = filteredSymbolIds;

            const numPages = Math.ceil(symbolIds.length / this.props.pageSize);

            return (
              <>
                <div className="search-results__section search-results__header">
                  <h1>{symbolIds.length} Results</h1>
                </div>

                {/* Symbol filters */}
                <div className="search-results__section">
                  Search for which symbols?
                  <div className="search-results__filter-buttons">
                    {symbolMathMlIds.map((mathMlId) => {
                      const variant =
                        this.state.filters[mathMlId] === undefined ||
                        this.state.filters[mathMlId] === true
                          ? "contained"
                          : "outlined";
                      return (
                        <div
                          key={mathMlId}
                          className="search-results__filter-button"
                        >
                          <Button
                            size="small"
                            variant={variant}
                            onClick={() => {
                              const filters = { ...this.state.filters };
                              if (
                                this.state.filters[mathMlId] === undefined ||
                                this.state.filters[mathMlId] === true
                              ) {
                                filters[mathMlId] = false;
                              } else {
                                filters[mathMlId] = true;
                              }
                              this.setFilters(filters);
                            }}
                          >
                            <MathMl mathMl={mathMls.byId[mathMlId].mathMl} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Search results */}
                <div className="search-results__symbol-list search-results__section">
                  {symbolIds
                    .slice(startSymbolIndex, endSymbolIndex)
                    .map((sId) => (
                      <div className="search-results__result" key={sId}>
                        <SymbolPreview symbol={symbols.byId[sId]} />
                      </div>
                    ))}
                </div>

                {/* Page buttons */}
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

  getFilteredSymbolIds(filters: Filters) {
    const {
      selectedEntityType,
      selectedEntityId,
      symbols,
      mathMls,
    } = this.context;

    if (
      selectedEntityType !== "symbol" ||
      selectedEntityId === null ||
      symbols === null ||
      mathMls === null
    ) {
      return [];
    }

    /*
     * Get an initial list of matching symbols.
     */
    const matchingSymbolIds = selectors.matchingSymbols(
      selectedEntityId,
      symbols,
      mathMls
    );

    /*
     * Filter to those symbols with the MathML filters selected.
     */
    const filteredSymbolIds = matchingSymbolIds.filter((sId) => {
      const symbolMathMlId = symbols.byId[sId].mathml;
      return (
        filters[symbolMathMlId] === true ||
        filters[symbolMathMlId] === undefined
      );
    });
    return filteredSymbolIds.filter(
      (sId, i) => filteredSymbolIds.indexOf(sId) === i
    );
  }
}

export default SearchResults;
