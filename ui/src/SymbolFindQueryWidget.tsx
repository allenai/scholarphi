import Button from "@material-ui/core/Button";
import React from "react";
import { ScholarReaderContext, SymbolFilter, SymbolFilters } from "./state";

export class SymbolFindQueryWidget extends React.PureComponent {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  toggleFilter(filter: SymbolFilter) {
    // TODO(andrewhead): Do type-checking before assuming the query is symbol filters.
    // TODO(andrewhead): Decide whether this belongs in this widget, or in FindBar
    const filters = this.context.findQuery as SymbolFilters;
    this.context.setState({
      findQuery: {
        ...filters,
        byId: {
          ...filters.byId,
          [filter.key]: {
            ...filter,
            active: !filter.active,
          },
        },
      },
    });
  }

  render() {
    const filters = this.context.findQuery as SymbolFilters;
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
