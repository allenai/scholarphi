import { PDFPageView } from "../../public/pdf.js/web/pdf_page_view";

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
