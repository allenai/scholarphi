import React from "react";
import { ScholarReaderContext } from "./state";
import { BoundingBox } from "./types/api";

interface PaperClippingProps {
  pageNumber: number;
  /**
   * Areas to highlight in the paper clipping. Either this or 'sentenceId' should be set. If
   * 'sentenceId' is not set, the canvas will be centered on the highlights. If the highlights
   * cover more area than specified by 'width' and 'height' or fall outside the sentence
   * specified by 'sentenceId', then they may not be visible.
   */
  highlights?: BoundingBox[];
  /**
   * Sentence to focus the paper clipping on. The sentence will be highlighted, and the paper
   * clipping bounds will be set to the bounds of the sentence. 'width' and 'height', if set,
   * will be ignored. Highlights will still be applied.
   */
  sentenceId?: string;
  /**
   * Width of element in pixels. If not provided, will be set to a default value.
   */
  width?: number;
  /**
   * Height of element in pixels. If not provided, will be set to a default value.
   */
  height?: number;
  onClick?: React.MouseEventHandler;
}

export class PaperClipping extends React.PureComponent<PaperClippingProps, {}> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  static defaultProps = {
    width: 500,
    height: 300
  };

  /**
   * The internals of this method deal with three coordinate systems:
   * 1. Ratio coordinates: See documentation for BoundingBox type.
   * 2. Canvas coordinates: width and height of canvas where the PDF preview is drawn.
   * 3. DOM coordinates: viewport of the container holding the canvas.
   */
  async componentDidMount() {
    const canvas = this.canvasRef;
    const container = this.containerRef;
    const { pdfDocument, sentences } = this.context;

    if (canvas == null || container == null || pdfDocument == null) {
      return;
    }

    const page = await pdfDocument.getPage(this.props.pageNumber);
    const CLIPPING_SCALE = 1.7;
    const clippingViewport = page.getViewport({ scale: CLIPPING_SCALE });

    const canvasContext = canvas.getContext("2d");
    if (canvasContext == null) {
      return;
    }
    canvas.width = clippingViewport.width;
    canvas.height = clippingViewport.height;

    await page.render({ canvasContext, viewport: clippingViewport }).promise;

    if (this.props.highlights !== undefined) {
      this.props.highlights.forEach(highlight => {
        addHighlightToCanvas(highlight, canvas, canvasContext, 0, 0, 255);
      });
    }

    /*
     * If a sentence was provided, set the dimensions of the container to just the size of the
     * sentence. Then scroll the container to focus on the sentence.
     */
    if (this.props.sentenceId && sentences !== null) {
      const sentence = sentences.byId[this.props.sentenceId];
      sentence.bounding_boxes.forEach(box => {
        addHighlightToCanvas(box, canvas, canvasContext, 0, 255, 0);
      });

      const sentenceBox = computerOuterBoundingBox(sentence.bounding_boxes);
      let { left, top, width, height } = toCanvasCoordinates(
        sentenceBox,
        canvas
      );

      /*
       * Add padding on all sides of the sentence box that's, in all directions, equivalent to
       * 2% of the page width.
       */
      const PADDING_AROUND_SENTENCE = 0.02;
      left -= width * PADDING_AROUND_SENTENCE;
      top -= width * PADDING_AROUND_SENTENCE;
      width += width * (PADDING_AROUND_SENTENCE * 2);
      height += width * (PADDING_AROUND_SENTENCE * 2);

      container.style.width = width + "px";
      container.style.height = height + "px";
      container.scrollLeft = left;
      container.scrollTop = top;
      return;
    }

    /*
     * If a sentence wasn't provided, determine the container dimensions from the properties.
     */
    container.style.width = this.props.width + "px";
    container.style.height = this.props.height + "px";

    /*
     * If highlights were provided, scroll the container to center on the highlighted boxes.
     */
    if (this.props.highlights !== undefined) {
      const highlightsOuterBox = computerOuterBoundingBox(
        this.props.highlights
      );
      const { left, top, width, height } = toCanvasCoordinates(
        highlightsOuterBox,
        canvas
      );
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      container.scrollLeft = Math.max(centerX - container.clientWidth / 2, 0);
      container.scrollTop = Math.max(centerY - container.clientHeight / 2, 0);
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

/**
 * Get a bounding box that contains all of a list of bounding boxes.
 * At least one bounding box must be provided.
 */
function computerOuterBoundingBox(boxes: BoundingBox[]) {
  let minLeft = Infinity;
  let minTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  boxes.forEach(b => {
    const { left, top } = b;
    const right = left + b.width;
    const bottom = top + b.height;

    minLeft = Math.min(minLeft, left);
    minTop = Math.min(minTop, top);
    maxRight = Math.max(maxRight, right);
    maxBottom = Math.max(maxBottom, bottom);
  });

  return {
    left: minLeft,
    top: minTop,
    width: maxRight - minLeft,
    height: maxBottom - minTop
  };
}

/*
 * TODO(andrewhead): Set fill color or style using a theme. Can also add a 'div' to make
 * it a controlled component.
 */
function addHighlightToCanvas(
  box: BoundingBox,
  canvas: HTMLCanvasElement,
  canvasContext: CanvasRenderingContext2D,
  red: number,
  green: number,
  blue: number
) {
  const HIGHLIGHT_OPACITY = 0.2;
  const { left, top, width, height } = toCanvasCoordinates(box, canvas);
  canvasContext.fillStyle = `rgba(${red}, ${green}, ${blue}, ${HIGHLIGHT_OPACITY})`;
  canvasContext.fillRect(left, top, width, height);
}

/**
 * Convert coordinates returned by the API to canvas coordinates. Note that y-coordinates for the
 * canvas will measure the distance down from the top of the canvas. This is consistent with canvas
 * y-coordinates (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes).
 */
function toCanvasCoordinates(rect: Rectangle, canvas: HTMLCanvasElement) {
  return {
    left: rect.left * canvas.width,
    top: rect.top * canvas.height,
    width: rect.width * canvas.width,
    height: rect.height * canvas.height
  };
}

interface Rectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

export default PaperClipping;
