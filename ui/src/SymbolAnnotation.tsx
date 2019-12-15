import React from "react";
import Annotation from "./Annotation";
import SymbolTooltipBody from "./SymbolTooltipBody";
import { ScholarReaderContext } from "./state";
import { BoundingBox, Symbol } from "./types/api";

interface SymbolAnnotationProps {
  location: BoundingBox;
  symbol: Symbol;
}

export class SymbolAnnotation extends React.Component<SymbolAnnotationProps> {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ highlightedSymbols, symbols, mathMl, setHighlightedSymbols }) => {
          return (
            <div hidden={this.props.symbol.parent !== null}>
              <Annotation
                id={`symbol-${this.props.symbol.id}-annotation`}
                location={this.props.location}
                tooltipContent={
                  <SymbolTooltipBody 
                    symbol={this.props.symbol} 
                    symbols={[...symbols]}
                    mathMl={[...mathMl]}
                    setHighlightedSymbols={setHighlightedSymbols}
                    clearHighlightedSymbols={() => 
                      /* only clear symbols if another annotation was not
                       * opened somewhere else. */
                      highlightedSymbols.has(this.props.symbol.id)
                      && setHighlightedSymbols(new Set())
                    }
                  />
                }
                highlighted={highlightedSymbols.has(this.props.symbol.id)}
              />
            </div>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

export default SymbolAnnotation;
