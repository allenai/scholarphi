import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist/types/src/display/api";

/**
 * Declarations for the PDF.js viewer application. These types are not declared as part of
 * @types/pdfjs-dist, probably because the PDF.js maintainers do not distribute the viewer
 * application with pdfjs-dist package.
 *
 * As we are building on top of Mozilla's viewer application, these typings help us type check
 * against expectations of the interface to viewer functionality.
 *
 * It's possible that these members may become inaccessible in future versions of the pdf.js
 * package. Take care when updating the 'pdf.js' submodule of this project to check that
 * all of these typings still accurately describe the interfaces available at runtime when
 * the application is launched from 'viewer.html'.
 */

interface PDFPageViewportOptions {
  viewBox: any;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  dontFlip: boolean;
}

interface PDFPageViewport {
  width: number;
  height: number;
  scale: number;
  transforms: number[];

  clone(options: PDFPageViewportOptions): PDFPageViewport;
  convertToViewportPoint(x: number, y: number): number[]; // [x, y]
  convertToViewportRectangle(rect: number[]): number[]; // [x1, y1, x2, y2]
  convertToPdfPoint(x: number, y: number): number[]; // [x, y]
}
export interface PDFViewerApplication {
  initialized: boolean;
  appConfig: AppConfig;
  eventBus: EventBus;
  externalServices: ExternalServices;
  pdfViewer: PDFViewer;
  pdfDocument: PDFDocumentProxy;
  pdfLinkService: PDFLinkService;
}

export interface AppConfig {
  toolbar: Toolbar;
}

export interface Toolbar {
  viewFind: HTMLDivElement;
}

export interface EventBus {
  on: (eventName: string, listener: (...args: any[]) => void) => void;
  dispatch: (eventName: string, ...args: any[]) => void;
}

export interface PageRenderedEvent {
  source: PDFPageView;
  pageNumber: number;
  cssTransform: boolean;
  timestamp: number;
}

export interface ExternalServices {
  supportsIntegratedFind: boolean;
  updateFindControlState: (state: {
    result: number;
    matchesCount: MatchInfo;
  }) => void;
  updateFindMatchesCount: (matchInfo: MatchInfo) => void;
}

export interface MatchInfo {
  current: number;
  total: number;
}

/**
 * States for the pdf.js find controller are defined at:
 * https://github.com/mozilla/pdf.js/blob/8cfdfb237abc3a20013306eb43dd4cfdb76e4a8e/web/pdf_find_controller.js#L20-L25
 */
export enum PdfJsFindControllerState {
  FOUND = 0,
  NOT_FOUND = 1,
  WRAPPED = 2,
  PENDING = 3,
}

export interface DocumentLoadedEvent {
  source: PDFDocumentProxy;
}

export interface PDFViewer {
  container: HTMLDivElement;
  viewer: HTMLDivElement;
  /**
   * Scroll the PDF viewer to a location of interest. Example usage:
   * pdfViewer.scrollPageIntoView({
   *     pageNumber: PAGE_NUMBER,  // page numbers start at 1.
   *     destArray: [
   *       undefined,
   *       { name: "XYZ" },
   *       LEFT_X_IN_PDF_COORDINATE_SYSTEM,
   *       TOP_Y_IN_PDF_COORDINATE_SYSTEM,
   *     ],
   *   });
   */
  scrollPageIntoView: (options: ScrollPageIntoViewOptions) => void;
  /**
   * XXX(andrewhead): ideally, this internal function shouldn't be used because we don't know if
   * pdf.js will maintain it. In practice, it is a very convenient function, as it lets the
   * caller scroll to a specific element in the viewer without knowing its coordinates.
   */
  _scrollIntoView: (options: ScrollIntoViewOptions) => void;
}

export interface PDFLinkService {
  navigateTo: (explicitDest: DestArray) => void;
}

/**
 * X and Y coordinates are in the PDF coordinate system, not in the viewport coordinate system.
 */
interface ScrollPageIntoViewOptions {
  pageNumber?: number;
  destArray?: DestArray | null;
  allowNegativeOffset?: boolean;
}

/**
 * First parameter is ignored by 'scrollPageIntoView' and can be 'undefined'.
 * Second parameter is used to declare the format of the remaining arguments.
 */
type DestArray = [any | undefined, DestinationType, any?, any?, any?, any?];

interface DestinationType {
  name: "XYZ" | "Fit" | "FitB" | "FitH" | "FitBH" | "FitV" | "FitBV" | "FitR";
}

interface ScrollIntoViewOptions {
  pageDiv: HTMLElement;
  pageSpot?: { left: number; top: number };
}

export interface PDFPageView {
  pdfPage: PDFPageProxy;
  canvas: HTMLCanvasElement;
  div: HTMLDivElement;
  scale: number;
  viewport: PDFPageViewport;
}
