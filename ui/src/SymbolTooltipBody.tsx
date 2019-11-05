import Button from "@material-ui/core/Button";
import React from "react";
import { PaperClipping } from "./PaperClipping";
import { ScholarReaderContext } from "./state";
import { BoundingBox, Symbol } from "./types/api";
import { PDFViewer } from "./types/pdfjs-viewer";

interface SymbolTooltipBodyProps {
  symbol: Symbol;
}

function scrollToBox(pdfViewer: PDFViewer, box: BoundingBox) {
  /*
   * Based roughly on the scroll offsets used for pdf.js "find" functionality:
   * https://github.com/mozilla/pdf.js/blob/16ae7c6960c1296370c1600312f283a68e82b137/web/pdf_find_controller.js#L190-L191
   * TODO(andrewhead): this offset should be in viewport coordinates, not PDF coordinates.
   */
  const SCROLL_OFFSET_X = -400;
  const SCROLL_OFFSET_Y = +100;

  pdfViewer.scrollPageIntoView({
    pageNumber: box.page + 1,
    destArray: [undefined, { name: "XYZ" }, box.left + SCROLL_OFFSET_X, box.top + SCROLL_OFFSET_Y]
  });
}

export class SymbolTooltipBody extends React.Component<SymbolTooltipBodyProps, {}> {
  render() {
    const firstBoundingBox = this.props.symbol.bounding_boxes[0];
    return (
      <div className="symbol-tooltip-body">
        <PaperClipping
          pageNumber={firstBoundingBox.page + 1}
          highlightBoxes={this.props.symbol.bounding_boxes}
        />
        <ScholarReaderContext.Consumer>
          {({ pdfViewer }) => (
            <Button
              onClick={() => {
                pdfViewer !== null && scrollToBox(pdfViewer, firstBoundingBox);
              }}
            >
              Jump to this location
            </Button>
          )}
        </ScholarReaderContext.Consumer>
      </div>
    );
  }
}

export default SymbolTooltipBody;
