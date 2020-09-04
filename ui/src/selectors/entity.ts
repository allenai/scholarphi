import { defaultMemoize } from "reselect";
import { Entities } from "../state";
import {
  BoundingBox,
  Entity,
  isSentence,
  isSymbol,
  isTerm,
  Relationship,
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
 * Compare the position of two entities. Use as a comparator when ordering entities
 * from top-to-bottom in the document.
 */
export function comparePosition(e1: Entity, e2: Entity) {
  if (e1.id === e2.id) {
    return 0;
  }
  if (
    e1.attributes.bounding_boxes.length === 0 ||
    e2.attributes.bounding_boxes.length === 0
  ) {
    return 0;
  }
  return compareBoxes(
    e1.attributes.bounding_boxes[0],
    e2.attributes.bounding_boxes[0]
  );
}

/**
 * Get the page number for the first page the entity appears on.
 */
export function firstPage(entity: Entity) {
  const boxes = entity.attributes.bounding_boxes;
  if (boxes.length === 0) {
    return null;
  }
  return Math.min(...boxes.map((b) => b.page));
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

/**
 * Order a list of definitions based on their accompanying contexts. 'definitions' and
 * 'contexts' should have the same dimensions, where each definition is associated with one context.
 * 'contexts' are used to sort the order of the definitions.
 */
export function orderExcerpts(
  excerpts: string[],
  contexts: Relationship[],
  entities: Entities
) {
  const contextualized = [];
  for (let i = 0; i < excerpts.length; i++) {
    const excerpt = excerpts[i];
    const context = contexts[i];
    if (context === undefined || context.id === null) {
      continue;
    }
    const contextEntity = entities.byId[context.id];
    if (contextEntity === undefined) {
      continue;
    }
    const contextPage = firstPage(contextEntity);
    if (contextPage === null) {
      continue;
    }
    contextualized.push({ excerpt, contextEntity });
  }
  return contextualized.sort((c1, c2) =>
    comparePosition(c1.contextEntity, c2.contextEntity)
  );
}

/**
 * Get definition that appears right before or after an entity. Don't include
 * a definition where the entity appears.
 */
export function adjacentDefinition(
  entityId: string,
  entities: Entities,
  where: "before" | "after"
) {
  const entity = entities.byId[entityId];
  const contexts = definitions([entityId], entities);
  if (
    entity === undefined ||
    !(isTerm(entity) || isSymbol(entity)) ||
    contexts.length === 0
  ) {
    return null;
  }
  const sentenceId = entity.relationships.sentence.id;
  return adjacentContext(sentenceId, entities, contexts, where);
}

/**
 * Get a list of definitions for a set of entities, ordered by their position in the paper.
 */
export function definitions(entityIds: string[], entities: Entities) {
  const entitiesWithDefinitions = entityIds
    .map((id) => entities.byId[id])
    .filter((e) => e !== undefined)
    .filter((e) => isTerm(e) || isSymbol(e))
    .map((e) => e as Term | Symbol);
  const definitions = entitiesWithDefinitions
    .map((e) => {
      if (isTerm(e)) {
        return e.attributes.definition_texs;
      } else {
        return e.attributes.definitions;
      }
    })
    .flat();
  const contexts = entitiesWithDefinitions
    .map((s) => s.relationships.definition_sentences)
    .flat();
  return orderExcerpts(definitions, contexts, entities);
}

export function inDefinition(entityId: string, entities: Entities) {
  const entity = entities.byId[entityId];
  if (entity === undefined || !(isSymbol(entity) && isTerm(entity))) {
    return false;
  }
  return entity.relationships.definition_sentences.some(
    (r) => r.id !== null && r.id === entity.relationships.sentence.id
  );
}

export function hasDefinition(entityId: string, entities: Entities) {
  const entity = entities.byId[entityId];
  if (entity === undefined || !(isSymbol(entity) || isTerm(entity))) {
    return false;
  }
  if (isTerm(entity)) {
    return entity.attributes.definition_texs.length > 0;
  }
  if (isSymbol(entity)) {
    return (
      entity.attributes.definitions.length > 0 ||
      entity.attributes.nicknames.length > 0
    );
  }
}

/**
 * Get the last context that appears right before an entity. Assumes that 'orderedContexts'
 * has already been ordered by document position.
 */
export function adjacentContext(
  entityId: string | null | undefined,
  entities: Entities,
  orderedContexts: { excerpt: string; contextEntity: Entity }[],
  where: "before" | "after"
) {
  if (orderedContexts.length === 0) {
    return null;
  }

  /*
   * If the requested entity doesn't exist, return the first context.
   */
  if (entityId === undefined || entityId === null) {
    return orderedContexts[0];
  }
  const entity = entities.byId[entityId];
  if (entity === undefined || entity === null) {
    return orderedContexts[0];
  }

  /*
   * Return the first context that appears before the entity.
   */
  if (where === "before") {
    const reversed = [...orderedContexts].reverse();
    for (const context of reversed) {
      if (comparePosition(context.contextEntity, entity) < 0) {
        return context;
      }
    }
  } else {
    for (const context of orderedContexts) {
      if (comparePosition(entity, context.contextEntity) < 0) {
        return context;
      }
    }
  }

  return null;
}

/**
 * Get a list of usages for a set of entities, ordered by their position in the paper.
 */
export function usages(entityIds: string[], entities: Entities) {
  const entitiesWithUsages = entityIds
    .map((id) => entities.byId[id])
    .filter((e) => e !== undefined)
    .filter((e) => isTerm(e) || isSymbol(e))
    .map((e) => e as Term | Symbol);
  const snippets = entitiesWithUsages.map((e) => e.attributes.snippets).flat();
  const contexts = entitiesWithUsages
    .map((s) => s.relationships.snippet_sentences)
    .flat();
  return orderExcerpts(snippets, contexts, entities);
}

/**
 * Rendering of equation TeX takes place using KaTeX. This leaves the rest of the text formatting
 * for the prose, like citations, references, citations, italics, bolds, and more as it appeared
 * in the raw TeX. This function performs some simple (brittle) replacements to attempt to turn the
 * raw TeX into plaintext.
 */
export function cleanTex(tex: string) {
  const noArgMacro = (name: string) => new RegExp(`\\\\${name}(?:{})?`, "g");
  const oneArgMacro = (name: string) =>
    new RegExp(`\\\\${name}\\{([^}]*)\\}`, "g");
  return tex
    .replace(/%.*?$/gm, "")
    .replace(oneArgMacro("label"), "")
    .replace(oneArgMacro("texttt"), "$1")
    .replace(oneArgMacro("textbf"), "$1")
    .replace(oneArgMacro("textit|emph"), "$1")
    .replace(oneArgMacro("footnote"), "")
    .replace(oneArgMacro("\\w*cite\\w*\\*?"), "[Citation]")
    .replace(oneArgMacro("(?:eq|c|)ref"), "[Reference]")
    .replace(oneArgMacro("gls(?:pl)?\\*"), (_, arg) => arg.toUpperCase())
    .replace(noArgMacro("bfseries"), "");
}
