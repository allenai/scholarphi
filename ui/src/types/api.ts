/**
 * Matches the schema of the data in the 'boundingbox' table in the database. At the time of
 * the writing of this comment, 'left', 'top', 'width', and 'height' were expressed in ratios
 * to the page width and height, rather than absolute coordinates
 *
 * For example, a bounding box is expressed as
 * {
 *   left: .1,
 *   right: .1,
 *   width: .2,
 *   height: .05
 * }
 *
 * if its absolute position is (50px, 100px), its width is (100px), and its
 * height is (50px) on a page with dimensions (W = 500px, H = 1000px).
 *
 * This representation of coordinates was chosen due to constraints in the design of the data
 * processing pipeline. More specifically, it's easier to extract ratio coordinates than absolute
 * coordinates when processing PDFs and PostScript files with Python.
 */
export interface BoundingBox {
  id: number;
  page: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Author {
  id: string;
  name: string;
  url: string;
}

export interface PaperIdWithCounts {
  s2Id: string;
  arxivId?: string;
  extractedSymbolCount: number;
  extractedCitationCount: number;
}

export interface Paper {
  s2Id: string;
  title: string;
  authors: Author[];
  abstract: string | null;
  url: string;
  venue: string | null;
  year: number | null;
  citationVelocity: number;
  influentialCitationCount: number;
}

export interface Citation {
  id: number;
  source: string;
  paper: string;
  bounding_boxes: BoundingBox[];
}

export interface Symbol {
  id: number;
  source: string;
  mathml: string;
  bounding_boxes: BoundingBox[];
  parent: number | null;
  children: number[];
}

export interface SymbolMatches {
  [id: number]: Set<number>;
}

export interface MathMl {
  mathMl: string;
  matches: MathMlMatch[];
}

export interface MathMlMatch {
  rank: number;
  mathMl: string;
}

export type AnnotationId = number;

export interface AnnotationData {
  type: "citation" | "symbol" | "equation";
  page: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Annotation {
  id: AnnotationId;
  type: "citation" | "symbol" | "equation";
  boundingBox: BoundingBox;
}

export interface UserInfo {
  user: {
    id: number;
  };
  entriesWithPaperIds: [number, string][];
}

export interface UserLibrary {
  paperIds: string[];
}
