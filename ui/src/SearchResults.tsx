import Button from "@material-ui/core/Button";
import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import MathMl from "./MathMl";
import * as selectors from "./selectors";
import { Entities } from "./state";
import SymbolPreview from "./SymbolPreview";
import { isSymbol } from "./types/api";

interface Props {
  pdfDocument: PDFDocumentProxy;
  pageSize: number;
  entities: Entities | null;
  selectedEntityId: string | null;
  handleSelectSymbol: (id: string) => void;
}

interface State {
  pageNumber: number;
  filters: Filters;
}

type Filters = { [mathMlId: string]: boolean };

export class SearchResults extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    /*
     * TODO(andrewhead): MathML filters should be reset for every search.
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
    const {
      entities,
      pdfDocument,
      selectedEntityId,
      handleSelectSymbol,
    } = this.props;

    const startSymbolIndex = this.state.pageNumber * this.props.pageSize;
    const endSymbolIndex = (this.state.pageNumber + 1) * this.props.pageSize;

    if (
      selectedEntityId === null ||
      entities === null ||
      selectors.selectedEntityType(selectedEntityId, entities) !== "symbol"
    ) {
      return <div className="search-results" />;
    }

    const matchingSymbolIds = selectors.matchingSymbols(
      selectedEntityId,
      entities
    );
    const symbolMathMlIds = selectors.symbolMathMls(
      matchingSymbolIds,
      entities
    );

    const filteredSymbolIds = this.getFilteredSymbolIds(this.state.filters);
    const numPages = Math.ceil(filteredSymbolIds.length / this.props.pageSize);

    return (
      <div className="search-results">
        <>
          <div className="search-results__section search-results__header">
            <h1>{filteredSymbolIds.length} Results</h1>
          </div>

          {/* Symbol filters */}
          <div className="search-results__section">
            Search for which symbols?
            {symbolMathMlIds.map((mathml) => {
              const variant =
                this.state.filters[mathml] === undefined ||
                this.state.filters[mathml] === true
                  ? "contained"
                  : "outlined";
              return (
                <div key={mathml} className="search-results__filter-button">
                  <Button
                    size="small"
                    variant={variant}
                    onClick={() => {
                      const filters = { ...this.state.filters };
                      if (
                        this.state.filters[mathml] === undefined ||
                        this.state.filters[mathml] === true
                      ) {
                        filters[mathml] = false;
                      } else {
                        filters[mathml] = true;
                      }
                      this.setFilters(filters);
                    }}
                  >
                    <MathMl mathMl={mathml} />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Search results */}
          <div className="search-results__symbol-list search-results__section">
            {filteredSymbolIds
              .slice(startSymbolIndex, endSymbolIndex)
              .map((sId) => {
                const symbol = entities.byId[sId];
                if (!isSymbol(symbol)) {
                  return null;
                }
                const sentence = selectors.symbolSentence(symbol.id, entities);

                return (
                  <div className="search-results__result" key={sId}>
                    <SymbolPreview
                      pdfDocument={pdfDocument}
                      symbol={symbol}
                      sentence={sentence}
                      handleSelectSymbol={handleSelectSymbol}
                    />
                  </div>
                );
              })}
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
      </div>
    );
  }

  getFilteredSymbolIds(filters: Filters) {
    const { selectedEntityId, entities } = this.props;

    if (
      selectedEntityId === null ||
      entities === null ||
      selectors.selectedEntityType(selectedEntityId, entities) !== "symbol"
    ) {
      return [];
    }

    /*
     * Get an initial list of matching symbols.
     */
    const matchingSymbolIds = selectors.matchingSymbols(
      selectedEntityId,
      entities
    );

    /*
     * Filter to those symbols with the MathML filters selected.
     */
    return matchingSymbolIds.filter((sId) => {
      const symbol = entities.byId[sId];
      if (isSymbol(symbol) && symbol.attributes.mathml !== null) {
        return (
          filters[symbol.attributes.mathml] === true ||
          filters[symbol.attributes.mathml] === undefined
        );
      }
      return false;
    });
  }
}

export default SearchResults;
