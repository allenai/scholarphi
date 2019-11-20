import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import { Citation, Paper, Symbol } from "./types/api";
import { PDFPageView, PDFViewer } from "./types/pdfjs-viewer";

export interface State {
  /*
   * Paper data.
   */
  citations: Readonly<Citation[]>;
  setCitations(citations: Citation[]): void;
  symbols: Readonly<Symbol[]>;
  setSymbols(symbols: Symbol[]): void;
  papers: Readonly<Papers>;
  setPapers(papers: Papers): void;

  /*
   * PDF viewer state.
   */
  pages: Readonly<Pages>;
  setPages(pages: Pages): void;
  pdfDocument: PDFDocumentProxy | null;
  pdfViewer: PDFViewer | null;

  /*
   * User interface state.
   */
  openDrawer: boolean;
  setOpenDrawer(open: boolean): void;
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
  citations: [],
  setCitations: (citations: Citation[]) => {
    return;
  },
  symbols: [],
  setSymbols: (symbols: Symbol[]) => {
    return;
  },
  papers: {},
  setPapers: (papers: Papers) => {
    return;
  },
  pages: {},
  setPages: (pages: Pages) => {
    return;
  },
  pdfDocument: null,
  pdfViewer: null,
  openDrawer: false,
  setOpenDrawer: (open: boolean) => {
    return;
  }
};

export const ScholarReaderContext = React.createContext<State>(defaultState);
