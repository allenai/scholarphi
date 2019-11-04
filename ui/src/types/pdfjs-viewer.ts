import { PDFDocumentProxy, PDFPageProxy, PDFPageViewport } from "pdfjs-dist";

/**
 * Declarations for the PDF.js viewer application. These types are not declared as part of
 * @types/pdfjs-dist, probably because the PDF.js maintainers do not distribute the viewer
 * application with pdfjs-dist package.
 *
 * As we are building on top of Mozilla's viewer application, these typings help us type check
 * against expectations of the interface to viewer functionality.
 */
export interface PDFViewerApplication {
  initialized: boolean;
  eventBus: EventBus;
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

export interface PDFPageView {
  pdfPage: PDFPageProxy;
  canvas: HTMLCanvasElement;
  div: HTMLDivElement;
  scale: number;
  viewport: PDFPageViewport;
}
