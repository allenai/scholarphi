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
  jumpSymbol: Symbol | null;
  setJumpSymbol(symbol: Symbol | null): void;
  annotationEnabled: boolean;
  setAnnotationEnabled(enabled: boolean): void;
  annotationType: "symbol" | "citation";
  setAnnotationType(type: "symbol" | "citation"): void;
  annotations: Readonly<Annotation[]>;
  addAnnotation(annotationData: AnnotationData): void;
  updateAnnotation(id: number, annotation: Annotation): void;
  deleteAnnotation(id: number): void;
  setAnnotations(annotations: Annotation[]): void;
  selectedAnnotation: Annotation | null;
  setSelectedAnnotation(annotation: Annotation | null): void;
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
  jumpSymbol: null,
  setJumpSymbol: () => {},
  annotationEnabled: false,
  annotationType: "citation",
  setAnnotationType: () => {},
  setAnnotationEnabled: () => {},
  annotations: [],
  addAnnotation: () => {},
  updateAnnotation: () => {},
  deleteAnnotation: () => {},
  setAnnotations: () => {},
  selectedAnnotation: null,
  setSelectedAnnotation: () => {}
};

export const ScholarReaderContext = React.createContext<State>(defaultState);
