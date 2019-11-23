import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import { Citation, MathMl, Paper, Symbol } from "./types/api";
import { PDFPageView, PDFViewer } from "./types/pdfjs-viewer";

export interface State {
  /*
   * PAPER DATA
   */
  citations: Readonly<Citation[]>;
  setCitations(citations: Citation[]): void;
  symbols: Readonly<Symbol[]>;
  setSymbols(symbols: Symbol[]): void;
  mathMl: Readonly<MathMl[]>;
  setMathMl(mathMl: MathMl[]): void;
  papers: Readonly<Papers>;
  setPapers(papers: Papers): void;

  /*
   * PDF VIEWER STATE
   */
  pages: Readonly<Pages>;
  setPages(pages: Pages): void;
  pdfDocument: PDFDocumentProxy | null;
  pdfViewer: PDFViewer | null;

  /*
   * USER INTERFACE STATE
   */
  openDrawer: boolean;
  setOpenDrawer(open: boolean): void;
  selectedSymbol: Symbol | null;
  setSelectedSymbol(symbol: Symbol | null): void;
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
  setCitations: () => {},
  symbols: [],
  setSymbols: () => {},
  mathMl: [],
  setMathMl: () => {},
  papers: {},
  setPapers: () => {},
  pages: {},
  setPages: () => {},
  pdfDocument: null,
  pdfViewer: null,
  openDrawer: false,
  setOpenDrawer: () => {},
  selectedSymbol: null,
  setSelectedSymbol: () => {}
};

export const ScholarReaderContext = React.createContext<State>(defaultState);
