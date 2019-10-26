import React from "react";
import { Citation } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

export interface State {
  citations: Citation[];
  pages: Pages;
}

/**
 * Indexed by page number.
 */
export type Pages = { [pageNumber: number]: PageModel };

interface PageModel {
  /**
   * Timestamp of 'pagerendered' event that created this page.
   */
  timeOfLastRender: number;
  /**
   * Reference to pdf.js page view object.
   */
  view: PDFPageView;
}

export const initialState = {
  citations: [],
  pages: []
};

export const ScholarReaderContext = React.createContext(initialState);
