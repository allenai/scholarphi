import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import SymbolTooltipBody from "./SymbolTooltipBody";
import { ScholarReaderContext } from "./state";
import { BoundingBox, Symbol } from "./types/api";

interface SymbolAnnotationProps {
  location: BoundingBox;
  symbol: Symbol;
  showHint?: boolean;
}

export class SymbolAnnotation extends React.PureComponent<SymbolAnnotationProps> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  shouldHighlight() {
    if (!this.context.selectedAnnotationId) { return false; }
    const [typeSelected, idSelected,] = this.context.selectedAnnotationId.split('-');
    if (typeSelected !== 'symbol') { return false; }
    
    const matchingSymbolIds = this.context.symbolMatchSet[Number(idSelected)];
    return matchingSymbolIds.has(this.props.symbol.id);
  }

  render() {
    return (
      <div hidden={this.props.symbol.parent !== null}>
        <Annotation
          id={`symbol-${this.props.symbol.id}-annotation`}
          className={classNames({ "annotation-hint": this.props.showHint })}
          source={this.props.symbol.source}
          location={this.props.location}
          tooltipContent={<SymbolTooltipBody symbol={this.props.symbol} />}
          shouldHighlight={this.shouldHighlight()}
        />
      </div>
    );
  }
}

export default SymbolAnnotation;
