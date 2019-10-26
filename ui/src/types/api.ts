export interface BoundingBox {
  page: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Paper {
  s2Id: string;
  title: string;
  authors: string;
  abstract: string | null;
  venue: string | null;
  year: number | null;
}

export interface Citation {
  bounding_boxes: BoundingBox[];
  papers: Paper[];
}
