import { Citation } from "../types/api";

export function boxEntityPairsForPage(
  citations: Citation[],
  pageNumber: number
) {
  const citationsWithBoxes = [];
  for (const citation of citations) {
    for (const boundingBox of citation.bounding_boxes) {
      if (boundingBox.page === pageNumber - 1) {
        citationsWithBoxes.push({ boundingBox, citation });
      }
    }
  }
  return citationsWithBoxes;
}
