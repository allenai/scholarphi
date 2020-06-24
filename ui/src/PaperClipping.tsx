import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import { BoundingBox, Sentence } from "./types/api";

interface Props {
  pdfDocument: PDFDocumentProxy;
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
  sentence?: Sentence | null;
  /**
   * Width of element in pixels. If not provided, will be set to a default value.
   */
  width?: number;
  /**
   * Height of element in pixels. If not provided, will be set to a default value.
   */
  height?: number;
  /**
   * Placeholder to show while the PDF canvas is being rendered. If no placeholder is provided,
   * nothing will be shown until the element is rendered.
   */
  placeholder?: JSX.Element;
  onClick?: React.MouseEventHandler;
  /**
   * Optional callback called when this component has been loaded, i.e., when the canvas has
   * finished rendereing.
   */
  onLoaded?: (container: HTMLDivElement, canvas: HTMLCanvasElement) => void;
}

interface State {
  firstRenderFinished: boolean;
}

/**
 * Get a bounding box that contains all of a list of bounding boxes.
 * At least one bounding box must be provided.
 */
function computeOuterBoundingBox(boxes: BoundingBox[]) {
  let minLeft = Infinity;
  let minTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  boxes.forEach((b) => {
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
    height: maxBottom - minTop,
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
    height: rect.height * canvas.height,
  };
}

interface Rectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

export class PaperClipping extends React.PureComponent<Props, State> {
  static defaultProps = {
    placeholder: null,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      firstRenderFinished: false,
    };
  }

  async componentDidMount() {
    this.updateCanvas();
  }

  async componentDidUpdate(prevProps: Props) {
    /*
     * Re-render the canvas when the properties change.
     */
    if (
      this.props.pdfDocument !== prevProps.pdfDocument ||
      this.props.pageNumber !== prevProps.pageNumber ||
      this.props.highlights !== prevProps.highlights ||
      this.props.sentence !== prevProps.sentence ||
      this.props.width !== prevProps.width ||
      this.props.height !== prevProps.height
    ) {
      this.updateCanvas();
    }
  }

  /**
   * The internals of this method deal with three coordinate systems:
   * 1. Ratio coordinates: See documentation for BoundingBox type.
   * 2. Canvas coordinates: width and height of canvas where the PDF preview is drawn.
   * 3. DOM coordinates: viewport of the container holding the canvas.
   */
  async updateCanvas() {
    const container = this.containerRef;
    const { pdfDocument } = this.props;

    if (container === null) {
      return;
    }

    const page = await pdfDocument.getPage(this.props.pageNumber);
    const CLIPPING_SCALE = 1.7;
    const clippingViewport = page.getViewport({ scale: CLIPPING_SCALE });

    /*
     * The process for rendering the page to a canvas roughly follows that in the pdf.js source code:
     * https://github.com/mozilla/pdf.js/blob/c1cb9ee9fc8f5af8f0a8ed1417ac716ac9477f24/web/pdf_page_view.js#L565
     */
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    const canvasContext = canvas.getContext("2d", { alpha: false });
    if (canvasContext == null) {
      return;
    }

    canvas.width = clippingViewport.width;
    canvas.height = clippingViewport.height;
    canvas.style.width = clippingViewport.width + "px";
    canvas.style.height = clippingViewport.height + "px";
    canvas.style.opacity = "0";

    /*
     * The magic order to be able render a page to a canvas without flickering seems to be to set
     * the canvas 'hidden' attribute to true, and then remove the hidden attribute right after the
     * call to 'render'. An earlier version of this code called 'removeAttribute' for 'hidden' at
     * the end of 'componentDidMount' (i.e., after the parent container was cropped and scrolled),
     * and this led to much of the canvas being completely blank.
     */
    canvas.setAttribute("hidden", "hidden");
    await page.render({ canvasContext, viewport: clippingViewport }).promise;
    canvas.removeAttribute("hidden");

    /*
     * Crop the container to the clipping region. Width and height will be set by props if
     * provided, and otherwise by the sentence. The scroll position of the container will be set
     * using either the sentence, or the highlights.
     */
    const { sentence } = this.props;
    let sentenceCanvasBox = null;
    if (sentence !== null && sentence !== undefined) {
      const sentenceBox = computeOuterBoundingBox(sentence.bounding_boxes);
      sentenceCanvasBox = toCanvasCoordinates(sentenceBox, canvas);
    }

    /*
     * Fallback width and height will only be used if width and height can't be determined from
     * input width and height or from sentence dimensions.
     */
    const FALLBACK_WIDTH = 300;
    const FALLBACK_HEIGHT = 150;
    const MAX_WIDTH = 400;
    const MAX_HEIGHT = 200;

    /*
     * If the paper is supposed to be clipped to a sentence, this padding will be added on all sides
     * of the sentence box bounding boxes.
     */
    const PADDING_AROUND_SENTENCE = 10;

    let clippingWidth;
    if (this.props.width !== undefined) {
      clippingWidth = this.props.width;
    } else if (sentenceCanvasBox !== null) {
      clippingWidth = sentenceCanvasBox.width + PADDING_AROUND_SENTENCE * 2;
    } else {
      clippingWidth = FALLBACK_WIDTH;
    }
    clippingWidth = Math.min(clippingWidth, MAX_WIDTH);

    let clippingHeight;
    if (this.props.height !== undefined) {
      clippingHeight = this.props.height;
    } else if (sentenceCanvasBox !== null) {
      clippingHeight = sentenceCanvasBox.height + PADDING_AROUND_SENTENCE * 2;
    } else {
      clippingHeight = FALLBACK_HEIGHT;
    }
    clippingHeight = Math.min(clippingHeight, MAX_HEIGHT);

    /*
     * Scroll the clipping to center either the sentence (if provided) or the highlights (if provided).
     */
    let scrollX = 0,
      scrollY = 0;

    let contentBox = null;
    if (sentenceCanvasBox !== null) {
      contentBox = sentenceCanvasBox;
    } else if (this.props.highlights !== undefined) {
      contentBox = toCanvasCoordinates(
        computeOuterBoundingBox(this.props.highlights),
        canvas
      );
    }

    if (contentBox !== null) {
      if (contentBox.width >= clippingWidth) {
        scrollX = contentBox.left;
      } else {
        const centerX = contentBox.left + contentBox.width / 2;
        scrollX = Math.max(centerX - clippingWidth / 2, 0);
      }

      if (contentBox.height >= clippingHeight) {
        scrollY = contentBox.top;
      } else {
        const centerY = contentBox.top + contentBox.height / 2;
        scrollY = Math.max(centerY - clippingHeight / 2, 0);
      }
    }

    /*
     * Add highlight marks to the canvas for the sentence and highlights.
     */
    if (this.props.highlights !== undefined) {
      this.props.highlights.forEach((highlight) => {
        addHighlightToCanvas(highlight, canvas, canvasContext, 0, 0, 255);
      });
    }
    if (sentence !== null && sentence !== undefined) {
      sentence.bounding_boxes.forEach((box) => {
        addHighlightToCanvas(box, canvas, canvasContext, 0, 255, 0);
      });
    }

    container.style.width = clippingWidth + "px";
    container.style.height = clippingHeight + "px";
    container.scrollLeft = scrollX;
    container.scrollTop = scrollY;
    /*
     * Don't remove the previous canvas until this canvas has been completely rendered.
     */
    if (this.canvas !== null) {
      container.removeChild(this.canvas);
    }

    this.setState({ firstRenderFinished: true });
    /*
     * The opacity is of the canvas is set initially to 0, and only set to 1 when the
     * canvas is scrolled completely rendered and scrolled to the right position. This is
     * because 'componentDidMount' reveals the canvas before scrolling it to the right
     * position. While initial tests haven't shown any flickering as the scrolling occurs,
     * this extra property should further ensure that there is none.
     */
    canvas.style.opacity = "1";
    this.canvas = canvas;
    if (this.props.onLoaded !== undefined) {
      this.props.onLoaded(container, canvas);
    }
  }

  render() {
    return (
      <div
        ref={(ref) => {
          this.containerRef = ref;
        }}
        className="paper-clipping"
        onClick={this.props.onClick}
      >
        {/*
         * The canvas gets rendered and appended to the container in the 'updateCanvas' method.
         * The helper method is used instead of rendering the canvas with JSX due to a special need:
         * when the properties change to this PaperClipping, it should be re-rendered without
         * flickering, which means that the previous canvas should remain showing until the new
         * canvas has been completely rendered. The 'updateCanvas' method handles rendering the
         * updated canvas, and swapping out the old canvas for the new one only when the new one
         * is completely finished rendering.
         */}
        {/*
         * If the canvas is still rendering for the first time, show the placeholder.
         */}
        {!this.state.firstRenderFinished ? this.props.placeholder : null}
      </div>
    );
  }

  containerRef: HTMLDivElement | null = null;
  canvas: HTMLCanvasElement | null = null;
}

export default PaperClipping;
