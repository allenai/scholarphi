import React from "react";
import { PaperClipping } from "./PaperClipping";
import * as selectors from "./selectors";
import { Symbol } from "./types/api";

interface SymbolTooltipBodyProps {
  symbol: Symbol;
}

export class SymbolTooltipBody extends React.Component<SymbolTooltipBodyProps, {}> {
  render() {
    const firstBoundingBox = this.props.symbol.bounding_boxes[0];
    return (
      <PaperClipping
        pageNumber={firstBoundingBox.page + 1}
        clipBounds={selectors.clipBounds(firstBoundingBox)}
        highlightBoxes={this.props.symbol.bounding_boxes}
      />
    );
  }
}

export default SymbolTooltipBody;
