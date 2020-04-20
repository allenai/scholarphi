import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import { ScholarReaderContext } from "./state";
import { BoundingBox, Symbol } from "./types/api";

interface SymbolAnnotationProps {
  boundingBoxes: BoundingBox[];
  symbol: Symbol;
  showHint?: boolean;
  highlight?: boolean;
}

export class SymbolAnnotation extends React.PureComponent<
  SymbolAnnotationProps
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  render() {
    return (
      <div hidden={this.props.symbol.parent !== null}>
        <Annotation
          id={`symbol-${this.props.symbol.id}-annotation`}
          className={classNames({ 
            "annotation-hint": this.props.showHint, 
            "annotation-is-the-selected-symbol": this.context.selectedEntityId === this.props.symbol.id,
          })}
          source={this.props.symbol.source}
          boundingBoxes={this.props.boundingBoxes}
          /* tooltipContent={<SymbolTooltipBody symbol={this.props.symbol} />} */
          tooltipContent={null}
          highlight={this.props.highlight}
          onSelected={this.selectEntityWhenAnnotationSelected.bind(this)}
          onDeselected={this.deselectEntityWhenAnnotationDeselected.bind(this)}
        />
      </div>
    );
  }

  selectEntityWhenAnnotationSelected() {
    this.context.setSelectedEntity(this.props.symbol.id, "symbol");
  }

  deselectEntityWhenAnnotationDeselected() {
    const {
      setSelectedEntity,
      selectedEntityId,
      selectedEntityType
    } = this.context;
    if (
      selectedEntityType === "symbol" &&
      selectedEntityId === this.props.symbol.id
    ) {
      setSelectedEntity(null, null);
    }
  }
}

export default SymbolAnnotation;
