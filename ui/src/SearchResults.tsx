import Button from "@material-ui/core/Button";
import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import MathMl from "./MathMl";
import * as selectors from "./selectors";
import { MathMls, SelectableEntityType, Sentences, Symbols } from "./state";
import SymbolPreview from "./SymbolPreview";

interface Props {
  pdfDocument: PDFDocumentProxy;
  pageSize: number;
  symbols: Symbols | null;
  mathMls: MathMls | null;
  sentences: Sentences | null;
  selectedEntityType: SelectableEntityType;
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
    const {
      sentences,
      symbols,
      mathMls,
      pdfDocument,
      selectedEntityType,
      selectedEntityId,
      handleSelectSymbol,
    } = this.props;

    const startSymbolIndex = this.state.pageNumber * this.props.pageSize;
    const endSymbolIndex = (this.state.pageNumber + 1) * this.props.pageSize;

    if (
      symbols === null ||
      mathMls === null ||
      selectedEntityType !== "symbol" ||
      selectedEntityId === null
    ) {
      return <div className="search-results" />;
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
            {symbolMathMlIds.map((mathMlId) => {
              const variant =
                this.state.filters[mathMlId] === undefined ||
                this.state.filters[mathMlId] === true
                  ? "contained"
                  : "outlined";
              return (
                <div key={mathMlId} className="search-results__filter-button">
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

          {/* Search results */}
          <div className="search-results__symbol-list search-results__section">
            {filteredSymbolIds
              .slice(startSymbolIndex, endSymbolIndex)
              .map((sId) => {
                const symbol = symbols.byId[sId];
                const sentence =
                  sentences !== null && symbol.sentence !== null
                    ? sentences.byId[symbol.sentence]
                    : null;
                return (
                  <div className="search-results__result" key={sId}>
                    <SymbolPreview
                      pdfDocument={pdfDocument}
                      symbol={symbols.byId[sId]}
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
    const {
      selectedEntityType,
      selectedEntityId,
      symbols,
      mathMls,
    } = this.props;

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
    return matchingSymbolIds.filter((sId) => {
      const symbolMathMlId = symbols.byId[sId].mathml;
      return (
        filters[symbolMathMlId] === true ||
        filters[symbolMathMlId] === undefined
      );
    });
  }
}

export default SearchResults;
