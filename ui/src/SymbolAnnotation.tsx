import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import * as selectors from "./selectors";
import SymbolTooltipBody from "./SymbolTooltipBody";
import { BoundingBox, Symbol } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface SymbolAnnotationProps {
  location: BoundingBox;
  symbol: Symbol;
  pageView: PDFPageView;
}

export class SymbolAnnotation extends React.Component<SymbolAnnotationProps, {}> {
  render() {
    return (
      <Tooltip
        interactive
        className="symbol-tooltip"
        title={<SymbolTooltipBody symbol={this.props.symbol} />}
      >
        <div
          className="scholar-reader-annotation symbol-annotation"
          style={selectors.divDimensionStyles(this.props.pageView, this.props.location)}
        ></div>
      </Tooltip>
    );
  }
}

export default SymbolAnnotation;
