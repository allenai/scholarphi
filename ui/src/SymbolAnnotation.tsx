import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import { ScholarReaderContext } from "./state";
import { BoundingBox, Symbol } from "./types/api";

interface SymbolAnnotationProps {
  boundingBoxes: BoundingBox[];
  symbol: Symbol;
  showHint?: boolean;
}

export class SymbolAnnotation extends React.PureComponent<
  SymbolAnnotationProps
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  shouldHighlight() {
    if (!this.context.selectedAnnotationId) {
      return false;
    }
    const [typeSelected, idSelected] = this.context.selectedAnnotationId.split(
      "-"
    );
    if (typeSelected !== "symbol") {
      return false;
    }

    const matchingSymbolIds = this.context.symbolMatches[Number(idSelected)];
    return matchingSymbolIds.has(this.props.symbol.id);
  }

  render() {
    return (
      <div hidden={this.props.symbol.parent !== null}>
        <Annotation
          id={`symbol-${this.props.symbol.id}-annotation`}
          className={classNames({ "annotation-hint": this.props.showHint })}
          source={this.props.symbol.source}
          boundingBoxes={this.props.boundingBoxes}
          /* tooltipContent={<SymbolTooltipBody symbol={this.props.symbol} />} */
          tooltipContent={null}
          shouldHighlight={this.shouldHighlight()}
        />
      </div>
    );
  }
}

export default SymbolAnnotation;
