import { Entities } from "../state";
import { Entity } from "../types/api";
import { Rectangle } from "../types/ui";

export function selectedEntityType(
  selectedEntityId: string | null,
  entities: Entities | null
): string | null {
  if (
    selectedEntityId === null ||
    entities === null ||
    entities.byId[selectedEntityId] === undefined
  ) {
    return null;
  }
  return entities.byId[selectedEntityId].type;
}

/**
 * If page is not specified, an outer bounding boxes is returned for the all bounding boxes
 * for the symbol on the same page as the first bounding box.
 */
export function outerBoundingBox(
  entity: Entity,
  page?: number
): Rectangle | null {
  if (entity.attributes.bounding_boxes.length === 0) {
    return null;
  }

  page = entity.attributes.bounding_boxes[0].page;
  const boxes = entity.attributes.bounding_boxes.filter((b) => b.page === page);
  if (boxes.length === 0) {
    return null;
  }

  const left = Math.min(...boxes.map((b) => b.left));
  const top = Math.min(...boxes.map((b) => b.top));
  const right = Math.max(...boxes.map((b) => b.left + b.width));
  const bottom = Math.max(...boxes.map((b) => b.top + b.height));
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

/**
 * Filter a list of entity IDs to just those in a specified page.
 */
export function entityIdsInPage(
  entityIds: string[],
  entities: Entities | null,
  page: number
) {
  if (entities === null) {
    return [];
  }
  return entityIds
    .map((e) => entities.byId[e])
    .filter((e) => e !== undefined)
    .filter((e) => e.attributes.bounding_boxes.some((b) => b.page === page))
    .map((e) => e.id);
}
