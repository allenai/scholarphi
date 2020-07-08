import { PDFDocumentProxy } from "pdfjs-dist";
import { DrawerMode } from "./Drawer";
import { FindMode, FindQuery, SymbolFilter } from "./FindBar";
import { Entity, Paper } from "./types/api";
import {
  PDFPageView,
  PDFViewer,
  PDFViewerApplication,
} from "./types/pdfjs-viewer";

/**
 * An object containing all the shared global state. It is designed to be used as follows:
 *
 * 1. For complex properties (i.e., lists and maps), it is expected that when updating these
 *    properties, an entirely new data structure will be created.
 *    This allows components to do strict equality comparisons on these properties to determine
 *    whether or not they have changed. For example, if you add a new citation
 *    to the list of citations, and want the annotations for citations to update, create a new
 *    citations array, and set the 'citations' property to point to this new array.
 *
 * 2. If you want to add new properties, keep the structure of the state as flat as possible.
 *    This keeps us from having to write complex code for setting state and for checking on the
 *    equality of properties when re-rendering.
 *
 * 3. You should pass data from this state through properties, not context. In the past, all
 *    global state was passed through context. Because the much of the state of this application
 *    is global (e.g., IDs of selected elements, queries for the find-bar, the data that was
 *    retrieved from the API), this caused two problems:
 *
 *    * Thousands of components would re-render whenever a single property changed on the state,
 *      leading to a feeling of lagginess when using most parts of the interface.
 *    * We couldn't uses React dev tools to find out what properties triggered a re-render, as
 *      this information is not collected for changes to context.
 *
 *    Although it requires passing much data through properites, for the time being the cost of
 *    more verbose code is worth the trade-off for improving our ability to optimize speed by
 *    having careful control over how global state will trigger re-renders.
 */
export interface State {
  /*
   * *** PAPER DATA ***
   */
  entities: Readonly<Entities> | null;
  papers: Readonly<Papers> | null;

  /*
   * *** USER LIBRARY DATA ***
   */
  userLibrary: UserLibrary | null;

  /*
   * *** PDF.JS OBJECTS ***
   */
  pages: Readonly<Pages> | null;
  pdfViewerApplication: PDFViewerApplication | null;
  pdfDocument: PDFDocumentProxy | null;
  pdfViewer: PDFViewer | null;

  /*
   * *** USER INTERFACE STATE ***
   */
  /*
   * ~ Selecting annotations and entities ~
   */
  annotationsShowing: boolean;
  selectedAnnotationId: string | null;
  selectedAnnotationSpanId: string | null;
  selectedEntityId: string | null;

  /*
   * ~ Drawer (sidebar) interactions ~
   */
  drawerMode: DrawerMode;

  /* 
   * ~ Find bar state ~
  /*
   * When 'isFindActive' is false, the rest of the properties for finding should be set to null.
   */
  isFindActive: boolean;
  findMode: FindMode;
  /*
   * The time in milliseconds that this 'find' action was triggered. The easiest way to
   * supply this value is to call `Date.now()` when a find action is triggered. This is used to
   * indicate to the find widget that a new 'find' has started, e.g., if a user types 'Ctrl+F'
   * while the 'find' bar is already open.
   */
  findActivationTimeMs: number | null;
  findQuery: FindQuery;
  /*
   * Valid values are [0..(findMatchCount - 1)]
   */
  findMatchIndex: number | null;
  findMatchCount: number | null;
  /*
   * A list of IDs of matching entities from the search. This will be defined for some find
   * modes (e.g., 'symbol') and not for others.
   */
  findMatchedEntities: string[] | null;

  /*
   * ~ User annotation layer ~
   */
  entityCreationEnabled: boolean;
  entityCreationType: KnownEntityType;
}

export type Entities = RelationalStore<Entity>;
export const KNOWN_ENTITY_TYPES = [
  "citation",
  "symbol",
  "equation",
  "sentence",
  "term",
] as const;
export type KnownEntityType = typeof KNOWN_ENTITY_TYPES[number];
export type Papers = { [s2Id: string]: Paper };
export type SymbolFilters = RelationalStore<SymbolFilter>;

export interface UserInfo {
  user: {
    id: number;
  };
  entriesWithPaperIds: [number, string][];
}

export interface UserLibrary {
  paperIds: string[];
}

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

export type SelectableEntityType = "citation" | "symbol" | null;

/**
 * Collections of data objects are stored in relational stores, comprising two properties:
 * * all:  an ordered list of IDs of the objects
 * * byId: a map from IDs to objects
 * This lets us perform a constant-time lookup of an entity by its ID. Entities refer to other
 * entities using their IDs, rather than containing their data. This convention was adopted
 * from Redux. For rationale and best practices, see
 * https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape
 */
interface RelationalStore<T> {
  all: string[];
  byId: { [id: string]: T };
}

/**
 * Convert an array into a relational store with the specified key as an ID.
 */
export function createRelationalStoreFromArray(array: any[], idKey: string) {
  const allIds = array
    .map((item) => item[idKey])
    .filter((key) => typeof key === "string");
  const itemsById = array
    .filter((item) => allIds.indexOf(item[idKey]) !== -1)
    .reduce((byId, item) => {
      byId[item[idKey]] = item;
      return byId;
    }, {});
  return {
    all: allIds,
    byId: itemsById,
  };
}
