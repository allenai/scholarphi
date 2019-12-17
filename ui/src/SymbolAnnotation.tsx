import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import SymbolTooltipBody from "./SymbolTooltipBody";
import { BoundingBox, Symbol } from "./types/api";

interface SymbolAnnotationProps {
  location: BoundingBox;
  symbol: Symbol;
  showHint?: boolean;
}

export class SymbolAnnotation extends React.PureComponent<SymbolAnnotationProps> {
  render() {
    return (
      <div hidden={this.props.symbol.parent !== null}>
        <Annotation
          id={`symbol-${this.props.symbol.id}-annotation`}
          className={classNames({'annotation-hint': this.props.showHint})}
          location={this.props.location}
          tooltipContent={<SymbolTooltipBody symbol={this.props.symbol} />}
        />
      </div>
    );
  }
}

export default SymbolAnnotation;
