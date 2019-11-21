import React from "react";
import { ScholarReaderContext } from "./state";
import { Symbol } from "./types/api";

interface SymbolTooltipBodyProps {
  symbol: Symbol;
}

interface SymbolTooltipBodyState {
  activeSymbol?: Symbol;
  activeSymbolIndex: number;
}

export class SymbolTooltipBody extends React.Component<
  SymbolTooltipBodyProps,
  SymbolTooltipBodyState
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  constructor(props: SymbolTooltipBodyProps) {
    super(props);
    this.state = {
      activeSymbolIndex: 0
    };
  }

  previousSymbol(symbols: Symbol[]) {
    const activeSymbolIndex =
      (this.state.activeSymbolIndex - 1) % symbols.length;
    this.setState({
      activeSymbolIndex,
      activeSymbol: symbols[activeSymbolIndex]
    });
  }

  nextSymbol(symbols: Symbol[]) {
    const activeSymbolIndex =
      (this.state.activeSymbolIndex + 1) % symbols.length;
    this.setState({
      activeSymbolIndex,
      activeSymbol: symbols[activeSymbolIndex]
    });
  }

  render() {
    return <div className="symbol-tooltip-body">You found a symbol!</div>;
  }
}

export default SymbolTooltipBody;
