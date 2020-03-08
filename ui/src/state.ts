import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import { FavoritableId } from "./FavoriteButton";
import {
  Annotation,
  AnnotationData,
  Citation,
  MathMl,
  Paper,
  Sentence,
  Symbol,
  SymbolMatches,
  UserAnnotationType,
  UserLibrary
} from "./types/api";
import { PDFPageView, PDFViewer } from "./types/pdfjs-viewer";

export interface State {
  /*
   * PAPER DATA
   */
  paperId?: PaperId;
  citations: Readonly<Citation[]>;
  setCitations(citations: Citation[]): void;
  symbols: Readonly<Symbol[]>;
  setSymbols(symbols: Symbol[]): void;
  symbolMatches: Readonly<SymbolMatches>;
  setSymbolMatches(matchSet: SymbolMatches): void;
  mathMl: Readonly<MathMl[]>;
  setMathMl(mathMl: MathMl[]): void;
  sentences: Readonly<Sentence[]>;
  setSentences(sentences: Sentence[]): void;
  papers: Readonly<Papers>;
  setPapers(papers: Papers): void;

  /*
   * USER DATA
   */
  userLibrary: UserLibrary | null;

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
  jumpPaperId: string | null;
  setJumpPaperId(s2Id: string | null): void;
  selectedSymbol: Symbol | null;
  setSelectedSymbol(symbol: Symbol | null): void;
  scrollSymbolHorizontallyIntoView(): void;
  selectedCitation: Citation | null;
  setSelectedCitation(citation: Citation | null): void;
  jumpSymbol: Symbol | null;
  setJumpSymbol(symbol: Symbol | null): void;
  annotationsShowing: boolean;
  setAnnotationsShowing(showing: boolean): void;
  selectedAnnotationId: string | null;
  setSelectedAnnotationId(id: string | null): void;
  selectedAnnotationSpanId: number | null;
  setSelectedAnnotationSpanId(id: number | null): void;
  userAnnotationsEnabled: boolean;
  setUserAnnotationsEnabled(enabled: boolean): void;
  userAnnotationType: UserAnnotationType;
  setUserAnnotationType(type: UserAnnotationType): void;
  userAnnotations: Readonly<Annotation[]>;
  addUserAnnotation(annotationData: AnnotationData): void;
  updateUserAnnotation(id: number, annotation: Annotation): void;
  deleteUserAnnotation(id: number): void;
  setUserAnnotations(annotations: Annotation[]): void;
  setUserLibrary(userLibrary: UserLibrary | null): void;
  addToLibrary(paperId: string, paperTitle: string): void;
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
  paperId: undefined,
  userLibrary: null,
  setUserLibrary: () => {},
  addToLibrary: () => {},
  citations: [],
  setCitations: () => {},
  symbols: [],
  setSymbols: () => {},
  symbolMatches: {},
  setSymbolMatches: () => {},
  mathMl: [],
  setMathMl: () => {},
  sentences: [],
  setSentences: () => {},
  papers: {},
  setPapers: () => {},
  pages: {},
  setPages: () => {},
  pdfDocument: null,
  pdfViewer: null,
  favorites: {},
  toggleFavorite: () => {},
  jumpPaperId: null,
  setJumpPaperId: () => {},
  selectedSymbol: null,
  setSelectedSymbol: () => {},
  scrollSymbolHorizontallyIntoView: () => {},
  selectedCitation: null,
  setSelectedCitation: () => {},
  jumpSymbol: null,
  setJumpSymbol: () => {},
  annotationsShowing: false,
  setAnnotationsShowing: () => {},
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
  setSelectedAnnotationId: () => {},
  selectedAnnotationSpanId: null,
  setSelectedAnnotationSpanId: () => {}
};

export const ScholarReaderContext = React.createContext<State>(defaultState);
