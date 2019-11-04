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

export interface Paper {
  s2Id: string;
  title: string;
  authors: Author[];
  abstract: string | null;
  url: string;
  venue: string | null;
  year: number | null;
}

export interface Citation extends Locatable {
  papers: string[];
}

export interface Symbol extends Locatable {
  tex: string;
}

export interface Locatable {
  bounding_boxes: BoundingBox[];
}
