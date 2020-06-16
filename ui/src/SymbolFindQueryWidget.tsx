import Button from "@material-ui/core/Button";
import React from "react";
import { SymbolFilter, SymbolFilters } from "./state";

interface SymbolFindQueryWidgetProps {
  filters: SymbolFilters;
  handleFilterChange: (filters: SymbolFilters) => void;
}

export class SymbolFindQueryWidget extends React.PureComponent<
  SymbolFindQueryWidgetProps
> {
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
              key={key}
              color={active ? "primary" : "secondary"}
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
