import React from "react";
import { Citation } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

export interface State {
  setCitations(citations: Citation[]): void;
  setPages(pages: Pages): void;
  citations: Readonly<Citation[]>;
  pages: Readonly<Pages>;
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

export interface PaperId {
  id: string;
  type: "s2" | "arxiv";
}

const defaultState: State = {
  setCitations: (citation: Citation[]) => {
    return;
  },
  setPages: (pages: Pages) => {
    return;
  },
  citations: [],
  pages: {}
};

export const ScholarReaderContext = React.createContext<State>(defaultState);
