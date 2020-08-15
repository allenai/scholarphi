import Button from "@material-ui/core/Button";
import React from "react";
import { SymbolFilter } from "./FindBar";
import RichText from "./RichText";
import { SymbolFilters } from "./state";

interface Props {
  filters: SymbolFilters;
  handleFilterChange: (filters: SymbolFilters) => void;
}

/**
 * Widget supporting symbol search. If only one symbol filter is provided, it's assumed to be a
 * filter describing the currently-selected symbol. If multiple filters are provided, the filters
 * are assumed to be for sub-symbols, and each filter can be toggled on or off.
 */
export class SymbolFindQueryWidget extends React.PureComponent<Props> {
  toggleFilter(filter: SymbolFilter) {
    this.props.handleFilterChange({
      ...this.props.filters,
      byId: {
        ...this.props.filters.byId,
        [filter.symbol.id]: {
          ...filter,
          active: !filter.active,
        },
      },
    });
  }

  render() {
    const { filters } = this.props;
    const toggleEnabled = filters.all.length > 1;
    return (
      <div className="symbol-filters">
        {filters.all.map((id: string) => {
          const filter = filters.byId[id];
          const { symbol, active } = filter;
          const { tex } = symbol.attributes;

          if (tex === null) {
            return null;
          }
          if (!toggleEnabled) {
            return (
              <span key={symbol.id} className="find-bar__message__span">
                Search results for <RichText>{tex}</RichText>
              </span>
            );
          } else {
            return (
              <Button
                className="filter-button"
                key={symbol.id}
                variant={"contained"}
                color={active ? "primary" : undefined}
                onClick={this.toggleFilter.bind(this, filter)}
              >
                <RichText>{tex}</RichText>
              </Button>
            );
          }
        })}
      </div>
    );
  }
}

export default SymbolFindQueryWidget;
