import { PDFDocumentProxy, PDFPageProxy, PDFPageViewport } from "pdfjs-dist";

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
export interface PDFViewerApplication {
  initialized: boolean;
  eventBus: EventBus;
  pdfViewer: PDFViewer;
  pdfDocument: PDFDocumentProxy;
}

export interface EventBus {
  on: (eventName: string, listener: (...args: any[]) => void) => void;
}

export interface PageRenderedEvent {
  source: PDFPageView;
  pageNumber: number;
  cssTransform: boolean;
  timestamp: number;
}

export interface DocumentLoadedEvent {
  source: PDFDocumentProxy;
}

export interface PDFViewer {
  scrollPageIntoView: (params: ScrollPageIntoViewParameters) => void;
  container: HTMLDivElement;
  viewer: HTMLDivElement;
}

interface ScrollPageIntoViewParameters {
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

export interface PDFPageView {
  pdfPage: PDFPageProxy;
  canvas: HTMLCanvasElement;
  div: HTMLDivElement;
  scale: number;
  viewport: PDFPageViewport;
}
