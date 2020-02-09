import { Papers } from "../state";
import { BoundingBox, Citation } from "../types/api";
import { boundingBoxString } from "./annotation";

/**
 * Unique identifier for a citation, comprised of bounding box coordinates and IDs of the papers
 * it references.
 */
export function citationKey(citation: Citation, boundingBox: BoundingBox) {
  return `${citation.paper} ${boundingBoxString(boundingBox)}`;
}

export function countOfCitationsWithSummaries(
  papers: Papers,
  paperIds: string[]
) {
  return paperIds.map(id => papers[id]).filter(paper => paper !== undefined)
    .length;
}
