import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import { convertToAnnotationId } from "./selectors/annotation";
import { BoundingBox, Symbol } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface SymbolAnnotationProps {
  pageView: PDFPageView;
  boundingBoxes: BoundingBox[];
  symbol: Symbol;
  showHint?: boolean;
  highlight?: boolean;
  selected: boolean;
  selectedSpanId: string | null;
  handleSelectSymbol: (id: string) => void;
  handleSelectAnnotation: (id: string) => void;
  handleSelectAnnotationSpan: (id: string) => void;
}

export class SymbolAnnotation extends React.PureComponent<
  SymbolAnnotationProps
> {
  render() {
    return (
      <div hidden={this.props.symbol.parent !== null}>
        <Annotation
          pageView={this.props.pageView}
          id={convertToAnnotationId(this.props.symbol.id)}
          className={classNames({ "annotation-hint": this.props.showHint })}
          source={this.props.symbol.source}
          boundingBoxes={this.props.boundingBoxes}
          /* tooltipContent={<SymbolTooltipBody symbol={this.props.symbol} />} */
          tooltipContent={null}
          selected={this.props.selected}
          selectedSpanId={this.props.selectedSpanId}
          highlight={this.props.highlight}
          onSelected={this.onSelected.bind(this)}
          handleSelectAnnotation={this.props.handleSelectAnnotation}
          handleSelectAnnotationSpan={this.props.handleSelectAnnotationSpan}
        />
      </div>
    );
  }

  onSelected() {
    this.props.handleSelectSymbol(this.props.symbol.id);
  }
}

export default SymbolAnnotation;
