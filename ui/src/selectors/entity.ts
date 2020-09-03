import { defaultMemoize } from "reselect";
import { Entities } from "../state";
import {
  BoundingBox,
  Entity,
  isSentence,
  isSymbol,
  isTerm,
  Sentence,
  Symbol,
  Term,
} from "../types/api";
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
 * Return all sentences containing a list of entities.
 */
export function sentences(entityIds: string[], entities: Entities): Sentence[] {
  return entityIds
    .map((id) => entities.byId[id])
    .filter((e) => e !== undefined)
    .filter((e) => isSymbol(e) || isTerm(e))
    .map((e) => e as Term | Symbol)
    .map((s) => s.relationships.sentence.id)
    .filter((sentId) => sentId !== null)
    .map((sentId) => entities.byId[sentId as string])
    .filter((sent) => sent !== undefined)
    .filter(isSentence);
}

/*
 * Highlight sentences that contain definition information.
 */
export function definingSentences(
  entityIds: string[],
  entities: Entities
): Sentence[] {
  const sentenceIds = [];

  /*
   * Accumulate defining sentences for symbols.
   */
  sentenceIds.push(
    ...entityIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter(isSymbol)
      .map((e) => [
        ...e.relationships.definition_sentences.map((r) => r.id),
        ...e.relationships.nickname_sentences.map((r) => r.id),
        ...e.relationships.defining_formula_equations.map((r) => r.id),
      ])
      .flat()
      .filter((id) => id !== null)
  );

  /*
   * Accumulate defining sentences for terms.
   */
  sentenceIds.push(
    ...entityIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter(isTerm)
      .map((e) => [...e.relationships.definition_sentences.map((r) => r.id)])
      .flat()
      .filter((id) => id !== null)
  );

  return sentenceIds
    .map((id) => entities.byId[id as string])
    .filter((e) => e !== undefined)
    .filter(isSentence);
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

function areBoxesVerticallyAligned(box1: BoundingBox, box2: BoundingBox) {
  const box1Bottom = box1.top + box1.height;
  const box2Bottom = box2.top + box2.height;
  return (
    (box1.top >= box2.top && box1.top <= box2Bottom) ||
    (box2.top >= box1.top && box2.top <= box1Bottom)
  );
}

/**
 * Comparator for sorting boxes from highest position in the paper to lowest.
 * See https://github.com/allenai/scholar-reader/issues/115 for a discussion for how we might
 * be able to sort symbols by their order in the prose instead of their position.
 */
export function compareBoxes(box1: BoundingBox, box2: BoundingBox) {
  if (box1.page !== box2.page) {
    return box1.page - box2.page;
  }
  if (areBoxesVerticallyAligned(box1, box2)) {
    return box1.left - box2.left;
  } else {
    return box1.top - box2.top;
  }
}

/**
 * Order a list of entity IDs by which ones appear first in the paper, using the position of
 * the symbol bounding boxes. Does not take columns into account. This method is memoized
 * because it's assumed that it will frequently be called with the list of all entities in
 * the paper, and that this sort will be costly.
 */
export const orderByPosition = defaultMemoize(
  (entityIds: string[], entities: Entities) => {
    const sorted = [...entityIds];
    sorted.sort((sId1, sId2) => {
      const symbol1Boxes = entities.byId[sId1].attributes.bounding_boxes;
      const symbol1TopBox = symbol1Boxes.sort(compareBoxes)[0];
      const symbol2Boxes = entities.byId[sId2].attributes.bounding_boxes;
      const symbol2TopBox = symbol2Boxes.sort(compareBoxes)[0];
      return compareBoxes(symbol1TopBox, symbol2TopBox);
    });
    return sorted;
  }
);
