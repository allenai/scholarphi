import React from "react";
import { ScholarReaderContext } from "./state";
import { BoundingBox } from "./types/api";

interface PaperClippingProps {
  pageNumber: number;
  highlightBoxes: BoundingBox[];
  onClick?: React.MouseEventHandler;
}

export class PaperClipping extends React.PureComponent<PaperClippingProps, {}> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  /**
   * The internals of this method deal with three coordinate systems:
   * 1. Ratio coordinates: See documentation for BoundingBox type.
   * 2. Canvas coordinates: width and height of canvas where the PDF preview is drawn.
   * 3. DOM coordinates: viewport of the container holding the canvas.
   */
  async componentDidMount() {
    const canvas = this.canvasRef;
    const container = this.containerRef;
    const { pdfDocument } = this.context;

    if (canvas == null || container == null || pdfDocument == null) {
      return;
    }

    const page = await pdfDocument.getPage(this.props.pageNumber);
    const CLIPPING_SCALE = 1.5;
    const clippingViewport = page.getViewport({ scale: CLIPPING_SCALE });

    const canvasContext = canvas.getContext("2d");
    if (canvasContext == null) {
      return;
    }
    canvas.width = clippingViewport.width;
    canvas.height = clippingViewport.height;

    await page.render({ canvasContext, viewport: clippingViewport }).promise;

    for (let i = 0; i < this.props.highlightBoxes.length; i++) {
      const box = this.props.highlightBoxes[i];
      /*
       * Convert coordinates returned by the API to canvas coordinates. Note that y-coordinates for the
       * canvas will measure the distance down from the top of the canvas. This is consistent with canvas
       * y-coordinates (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes).
       */
      const [left, top, width, height] = [
        box.left * canvas.width,
        box.top * canvas.height,
        box.width * canvas.width,
        box.height * canvas.height
      ];
      /*
       * TODO(andrewhead): Set fill color or style using a theme. Can also add a 'div' to make
       * it a controlled component.
       */
      canvasContext.fillStyle = "rgba(0, 0, 255, 0.4)";
      canvasContext.fillRect(left, top, width, height);

      /*
       * Set scroll of PDF page to center on the first highlighted element.
       * TODO(andrewhead): consider scrolling to center the *center* of all highlight boxes.
       */
      if (i === 0) {
        const highlightCenterX = left + width / 2;
        const highlightCenterY = top + height / 2;
        container.scrollLeft = Math.max(
          highlightCenterX - container.clientWidth / 2,
          0
        );
        container.scrollTop = Math.max(
          highlightCenterY - container.clientHeight / 2,
          0
        );
      }
    }
  }

  render() {
    return (
      <div
        ref={ref => {
          this.containerRef = ref;
        }}
        className="paper-clipping"
        onClick={this.props.onClick}
      >
        <canvas
          ref={ref => {
            this.canvasRef = ref;
          }}
        />
      </div>
    );
  }

  containerRef: HTMLDivElement | null = null;
  canvasRef: HTMLCanvasElement | null = null;
}

export default PaperClipping;
