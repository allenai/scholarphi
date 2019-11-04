import { BoundingBox, Locatable } from "../types/api";

export function boxEntityPairsForPage<T extends Locatable>(
  entities: T[],
  pageNumber: number
): BoxEntityPair<T>[] {
  const locatablesWithBoxes = [];
  for (const entity of entities) {
    for (const boundingBox of entity.bounding_boxes) {
      if (boundingBox.page === pageNumber - 1) {
        locatablesWithBoxes.push({ boundingBox, entity });
      }
    }
  }
  return locatablesWithBoxes;
}

interface BoxEntityPair<T extends Locatable> {
  entity: T;
  boundingBox: BoundingBox;
}
