export interface BoundingBox {
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
  papers: string[];
  bounding_boxes: BoundingBox[];
}

export interface Symbol {
  id: number;
  mathml: string;
  bounding_box: BoundingBox;
  parent: number | null;
  children: number[];
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
  boundingBox: BoundingBox;
}

export interface Annotation extends AnnotationData {
  id: AnnotationId;
}


export interface UserInfo {
  user: {
    id: number
  }
  entriesWithPaperIds: [number, string][]
}

export interface UserLibrary {
  userId: number,
  paperIds: string[]
}

export interface CachedUserLibrary {
  userLibrary: UserLibrary,
  expires: number
}
