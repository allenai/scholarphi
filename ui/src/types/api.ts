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
  type: "citation" | "symbol";
  page: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Annotation {
  id: AnnotationId;
  type: "citation" | "symbol";
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
