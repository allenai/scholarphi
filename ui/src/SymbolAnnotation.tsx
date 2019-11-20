import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import SymbolTooltipBody from "./SymbolTooltipBody";
import { BoundingBox, Symbol } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

interface SymbolAnnotationProps {
  location: BoundingBox;
  symbol: Symbol;
  pageView: PDFPageView;
}

export class SymbolAnnotation extends React.Component<
  SymbolAnnotationProps,
  {}
> {
  render() {
    return (
      <Tooltip
        interactive
        className="symbol-tooltip"
        title={<SymbolTooltipBody symbol={this.props.symbol} />}
      >
        <ScholarReaderContext.Consumer>
          {({ setOpenDrawer }) => {
            return (
              <div
                className="scholar-reader-annotation symbol-annotation"
                hidden={this.props.symbol.parent !== null}
                style={selectors.divDimensionStyles(
                  this.props.pageView,
                  this.props.location
                )}
                onClick={() => setOpenDrawer(true)}
              />
            );
          }}
        </ScholarReaderContext.Consumer>
      </Tooltip>
    );
  }
}

export default SymbolAnnotation;
