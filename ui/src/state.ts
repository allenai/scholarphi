import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import { FavoritableId } from "./FavoriteButton";
import {
  Annotation,
  AnnotationData,
  Citation,
  MathMl,
  Paper,
  Symbol
} from "./types/api";
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
  favorites: { [favoritableKey: string]: boolean };
  toggleFavorite(favoritableId: FavoritableId): void;
  drawerState: DrawerState;
  setDrawerState(state: DrawerState): void;
  jumpPaperId: string | null;
  setJumpPaperId(s2Id: string | null): void;
  selectedSymbol: Symbol | null;
  setSelectedSymbol(symbol: Symbol | null): void;
  highlightedSymbols: Set<number>;
  setHighlightedSymbols(symbolIds: Set<number>): void;
  jumpSymbol: Symbol | null;
  setJumpSymbol(symbol: Symbol | null): void;
  selectedAnnotationId: string | null;
  setSelectedAnnotationId(id: string | null): void;
  userAnnotationsEnabled: boolean;
  setUserAnnotationsEnabled(enabled: boolean): void;
  userAnnotationType: "symbol" | "citation";
  setUserAnnotationType(type: "symbol" | "citation"): void;
  userAnnotations: Readonly<Annotation[]>;
  addUserAnnotation(annotationData: AnnotationData): void;
  updateUserAnnotation(id: number, annotation: Annotation): void;
  deleteUserAnnotation(id: number): void;
  setUserAnnotations(annotations: Annotation[]): void;
}

export type Papers = { [s2Id: string]: Paper };
export type Pages = { [pageNumber: number]: PageModel };
export type DrawerState = "show-citations" | "show-symbols" | "closed";

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
  favorites: {},
  toggleFavorite: () => {},
  drawerState: "closed",
  setDrawerState: () => {},
  jumpPaperId: null,
  setJumpPaperId: () => {},
  selectedSymbol: null,
  setSelectedSymbol: () => {},
  highlightedSymbols: new Set(),
  setHighlightedSymbols: () => {},
  jumpSymbol: null,
  setJumpSymbol: () => {},
  userAnnotationsEnabled: false,
  userAnnotationType: "citation",
  setUserAnnotationType: () => {},
  setUserAnnotationsEnabled: () => {},
  userAnnotations: [],
  addUserAnnotation: () => {},
  updateUserAnnotation: () => {},
  deleteUserAnnotation: () => {},
  setUserAnnotations: () => {},
  selectedAnnotationId: null,
  setSelectedAnnotationId: () => {}
};

export const ScholarReaderContext = React.createContext<State>(defaultState);
