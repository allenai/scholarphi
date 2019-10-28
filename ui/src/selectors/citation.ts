import { BoundingBox, Citation } from "../types/api";

/**
 * Unique identifier for a citation, comprised of bounding box coordinates and IDs of the papers it references.
 */
export function citationKey(bounding_box: BoundingBox, citation: Citation) {
  return (
    `${bounding_box.page}-L${bounding_box.left}-T${bounding_box.top}-W${bounding_box.width}-H${bounding_box.height} ` +
    `${citation.papers.map(p => p.s2Id).join("-")}`
  );
}
