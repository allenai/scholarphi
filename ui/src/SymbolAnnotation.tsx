import React from "react";
import Annotation from "./Annotation";
import SymbolTooltipBody from "./SymbolTooltipBody";
import { BoundingBox, Symbol } from "./types/api";

interface SymbolAnnotationProps {
  location: BoundingBox;
  symbol: Symbol;
}

export class SymbolAnnotation extends React.Component<SymbolAnnotationProps> {
  render() {
    return (
      <div hidden={this.props.symbol.parent !== null}>
        <Annotation
          id={`symbol-${this.props.symbol.id}-annotation`}
          location={this.props.location}
          tooltipContent={<SymbolTooltipBody symbol={this.props.symbol} />}
        />
      </div>
    );
  }
}

export default SymbolAnnotation;
