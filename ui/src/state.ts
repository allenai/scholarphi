import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import {
  Annotation,
  AnnotationData,
  Citation,
  MathMl,
  Paper,
  Sentence,
  Symbol,
  UserAnnotationType,
  UserLibrary
} from "./types/api";
import { PDFPageView, PDFViewer } from "./types/pdfjs-viewer";

export interface State {
  /*
   * PAPER DATA
   */
  paperId?: PaperId;
  citations: Readonly<Citations> | null;
  setCitations(citations: Citations | null): void;
  symbols: Readonly<Symbols> | null;
  setSymbols(symbols: Symbols | null): void;
  mathMls: Readonly<MathMls> | null;
  setMathMls(mathMls: MathMls | null): void;
  sentences: Readonly<Sentences> | null;
  setSentences(sentences: Sentences | null): void;
  papers: Readonly<Papers> | null;
  setPapers(papers: Papers | null): void;

  /*
   * USER DATA
   */
  userLibrary: UserLibrary | null;
  setUserLibrary(userLibrary: UserLibrary | null): void;
  addToLibrary(paperId: string, paperTitle: string): void;

  /*
   * PDF VIEWER STATE
   */
  pages: Readonly<Pages> | null;
  setPages(pages: Pages): void;
  pdfDocument: PDFDocumentProxy | null;
  pdfViewer: PDFViewer | null;

  /*
   * USER INTERFACE STATE
   */
  /*
   * Selecting annotations and entities
   */
  annotationsShowing: boolean;
  setAnnotationsShowing(showing: boolean): void;
  selectedAnnotationId: string | null;
  setSelectedAnnotationId(id: string | null): void;
  selectedAnnotationSpanId: string | null;
  setSelectedAnnotationSpanId(id: string | null): void;
  selectedEntityType: SelectableEntityType;
  selectedEntityId: string | null;
  setSelectedEntity(id: string | null, type: SelectableEntityType): void;

  /*
   * Jumping to content within paper
   */
  paperJumpRequest: string | null;
  requestJumpToPaper(s2Id: string | null): void;

  /*
   * Drawer (sidebar) interactions
   */
  drawerState: DrawerState;
  setDrawerState(open: DrawerState): void;
  scrollSymbolIntoView(): void;

	/*
	 * Find Bar interactions
	 */
	findBarState: FindBarState;
	setFindBarState(state: FindBarState): void;

  /*
   * User annotation layer
   */
  userAnnotationsEnabled: boolean;
  setUserAnnotationsEnabled(enabled: boolean): void;
  userAnnotationType: UserAnnotationType;
  setUserAnnotationType(type: UserAnnotationType): void;
  userAnnotations: Readonly<Annotation[]>;
  addUserAnnotation(annotationData: AnnotationData): void;
  updateUserAnnotation(id: string, annotation: Annotation): void;
  deleteUserAnnotation(id: string): void;
  setUserAnnotations(annotations: Annotation[]): void;
}

/**
 * The state follows the Redux convention of storing lists of application entities in a two-part
 * structure: a list of IDs of all entities, and a map from IDs to entities. This means that at
 * any time you can do a constant-time lookup of an entity by its ID. Entities refer to other
 * entities using their IDs, rather than containing their data.
 */
interface StateSlice<T> {
  all: string[];
  byId: { [id: string]: T };
}

/**
 * Allow the lookup of which symbols use what MathML.
 */
export interface MathMlWithSymbols extends MathMl {
  symbols: string[];
}

export type SelectableEntityType = "citation" | "symbol" | null;

export type Citations = StateSlice<Citation>;
export type Symbols = StateSlice<Symbol>;
export type MathMls = StateSlice<MathMlWithSymbols>;
export type Sentences = StateSlice<Sentence>;

export type Papers = { [s2Id: string]: Paper };
export type Pages = { [pageNumber: number]: PageModel };

export function createStateSliceFromArray(array: any[], idKey: string) {
  const allIds = array
    .map(item => item[idKey])
    .filter(key => typeof key === "string");
  const itemsById = array
    .filter(item => allIds.indexOf(item[idKey]) !== -1)
    .reduce((byId, item) => {
      byId[item[idKey]] = item;
      return byId;
    }, {});
  return {
    all: allIds,
    byId: itemsById
  };
}

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

export type DrawerState = "open" | "closed";
export type FindBarState = "hidden" | "symbol" | "string";

export const defaultState: State = {
  paperId: undefined,
  citations: null,
  setCitations: () => {},
  symbols: null,
  setSymbols: () => {},
  mathMls: null,
  setMathMls: () => {},
  sentences: null,
  setSentences: () => {},
  papers: null,
  setPapers: () => {},

  userLibrary: null,
  setUserLibrary: () => {},
  addToLibrary: () => {},

  pages: null,
  setPages: () => {},
  pdfDocument: null,
  pdfViewer: null,

  annotationsShowing: true,
  setAnnotationsShowing: () => {},
  selectedAnnotationId: null,
  setSelectedAnnotationId: () => {},
  selectedAnnotationSpanId: null,
  setSelectedAnnotationSpanId: () => {},
  selectedEntityType: null,
  selectedEntityId: null,
  setSelectedEntity: () => {},

  paperJumpRequest: null,
  requestJumpToPaper: () => {},

  drawerState: "closed",
  setDrawerState: () => {},
  scrollSymbolIntoView: () => {},

	setFindBarState: () => {},
  findBarState: "hidden",

  userAnnotationsEnabled: false,
  setUserAnnotationsEnabled: () => {},
  userAnnotationType: "citation",
  setUserAnnotationType: () => {},
  userAnnotations: [],
  addUserAnnotation: () => {},
  updateUserAnnotation: () => {},
  deleteUserAnnotation: () => {},
  setUserAnnotations: () => {}
};

export const ScholarReaderContext = React.createContext<State>(defaultState);
