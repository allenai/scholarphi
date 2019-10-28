import { BoundingBox, Citation } from "../types/api";

export function citationsForPage(citations: Citation[], pageNumber: number): LocalizedCitation[] {
  const localizedCitations = [];
  for (const citation of citations) {
    for (const bounding_box of citation.bounding_boxes) {
      if (bounding_box.page === pageNumber - 1) {
        localizedCitations.push({ bounding_box, citation });
      }
    }
  }
  return localizedCitations;
}

interface LocalizedCitation {
  bounding_box: BoundingBox;
  citation: Citation;
}
