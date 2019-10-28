import React from "react";
import { Citation, Paper } from "./types/api";
import { PDFPageView } from "./types/pdfjs-viewer";

export interface State {
  citations: Readonly<Citation[]>;
  papers: Readonly<Papers>;
  pages: Readonly<Pages>;

  setCitations(citations: Citation[]): void;
  setPapers(papers: Papers): void;
  setPages(pages: Pages): void;
}

export type Papers = { [s2Id: string]: Paper };
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
  setPapers: (papers: Papers) => {
    return;
  },
  setPages: (pages: Pages) => {
    return;
  },
  citations: [],
  papers: {},
  pages: {}
};

export const ScholarReaderContext = React.createContext<State>(defaultState);
