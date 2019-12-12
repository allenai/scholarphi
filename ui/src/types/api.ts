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
}

export interface Citation {
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
