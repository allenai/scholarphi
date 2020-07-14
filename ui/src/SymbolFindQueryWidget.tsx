import Button from "@material-ui/core/Button";
import React from "react";
import { SymbolFilter } from "./FindBar";
import { SymbolFilters } from "./state";

interface Props {
  filters: SymbolFilters;
  handleFilterChange: (filters: SymbolFilters) => void;
}

export class SymbolFindQueryWidget extends React.PureComponent<Props> {
  toggleFilter(filter: SymbolFilter) {
    this.props.handleFilterChange({
      ...this.props.filters,
      byId: {
        ...this.props.filters.byId,
        [filter.key]: {
          ...filter,
          active: !filter.active,
        },
      },
    });
  }

  render() {
    const { filters } = this.props;
    return (
      <div className="symbol-filters">
        {filters.all.map((id: string) => {
          const filter = filters.byId[id];
          const { key, active } = filter;
          return (
            <Button
              className="filter-button"
              key={key}
              variant={"contained"}
              color={active ? "primary" : undefined}
              onClick={this.toggleFilter.bind(this, filter)}
            >
              {filter.key}
            </Button>
          );
        })}
      </div>
    );
  }
}

export default SymbolFindQueryWidget;
