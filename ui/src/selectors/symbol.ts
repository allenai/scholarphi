import { defaultMemoize } from "reselect";
import { SymbolFilter } from "../FindBar";
import { Entities } from "../state";
import {
  BoundingBox,
  isSentence,
  isSymbol,
  Relationship,
  Sentence,
  Symbol,
} from "../types/api";

/**
 * Return the sentence for this symbol if one exists, otherwise null.
 */
export function symbolSentence(
  symbolId: string,
  entities: Entities
): Sentence | null {
  const symbol = entities.byId[symbolId];
  if (!isSymbol(symbol)) {
    return null;
  }
  const sentenceId = symbol.relationships.sentence.id;
  if (sentenceId !== null && entities.byId[sentenceId] !== undefined) {
    const sentence = entities.byId[sentenceId];
    if (isSentence(sentence)) {
      return sentence;
    }
  }
  return null;
}

export const symbolIds = defaultMemoize((entities: Entities) => {
  return entities.all.filter((eId) => isSymbol(entities.byId[eId]));
});

/**
 * Get a list of IDs of all symbols that with similar MathML. Returned list of symbols will
 * be in the order the symbols appear in the document.
 */
export const matchingSymbols = defaultMemoize(
  (symbolId: string, entities: Entities, symbolFilters?: SymbolFilter[]) => {
    const symbol = entities.byId[symbolId] as Symbol;

    /*
     * Get ordered list of all symbols for sorting the matching symbols later. Sort all of the
     * symbols instead of sorting the matching symbols so that the sort can be run once for all
     * calls to this method and memoized.
     */
    const orderedSymbolIds = orderByPosition(symbolIds(entities), entities);

    return orderedSymbolIds
      .map((sId) => entities.byId[sId])
      .map((s) => s as Symbol)
      .filter((otherSymbol) => {
        /*
         * If no filters were provided, or if no filters activated or deactivated, every match
         * returned by the backend is considered valid.
         */
        if (
          !symbolFilters ||
          !symbolFilters.some((f) => f.active !== undefined)
        ) {
          return otherSymbol.attributes.mathml === symbol.attributes.mathml;
        }
        if (symbolFilters.some((f) => f.key === "exact-match" && f.active)) {
          return otherSymbol.attributes.mathml === symbol.attributes.mathml;
        }
        return (
          symbolFilters.some((f) => f.key === "partial-match" && f.active) &&
          otherSymbol.attributes.mathml !== null &&
          symbol.attributes.mathml_near_matches.indexOf(
            otherSymbol.attributes.mathml
          ) !== -1
        );
      })
      .map((s) => s.id);
  }
);

/**
 * Determine if 'symbol1' is a child of 'symbol2'.
 */
export function isChild(symbol1: Symbol, symbol2: Symbol) {
  return symbol2.relationships.children.some((c) => c.id === symbol1.id);
}

/**
 * Determine if 'symbol1' is a descendant of 'symbol2'.
 */
export function isDescendant(
  symbol1: Symbol,
  symbol2: Symbol,
  entities: Entities
) {
  let parent: Relationship = symbol1.relationships.parent;
  while (parent.id !== null) {
    const parentEntity = entities.byId[parent.id];
    if (parentEntity !== undefined && isSymbol(parentEntity)) {
      if (parentEntity === symbol2) {
        return true;
      }
      parent = parentEntity.relationships.parent;
    }
  }
  return false;
}

/**
 * Get a list of the unique MathML equations used in this set of symbols. Guaranteed to match the
 * order they were found when iterating through the list sequentially. Therefore if you sort the
 * the symbols, the MathML returned will match that sort order.
 */
export function symbolMathMls(symbolIds: string[], entities: Entities) {
  const uniqueMathMls: string[] = [];
  symbolIds.forEach((sId) => {
    const mathMl = (entities.byId[sId] as Symbol).attributes.mathml;
    if (mathMl !== null && uniqueMathMls.indexOf(mathMl) === -1) {
      uniqueMathMls.push(mathMl);
    }
  });
  return uniqueMathMls;
}

/**
 * Comparator for sorting boxes from highest position in the paper to lowest.
 * See https://github.com/allenai/scholar-reader/issues/115 for a discussion for how we might
 * be able to sort symbols by their order in the prose instead of their position.
 */
function compareBoxes(box1: BoundingBox, box2: BoundingBox) {
  if (box1.page !== box2.page) {
    return box1.page - box2.page;
  }
  if (areBoxesVerticallyAligned(box1, box2)) {
    return box1.left - box2.left;
  } else {
    return box1.top - box2.top;
  }
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
 * Order a list of symbol IDs by which ones appear first in the paper, using the position of
 * the symbol bounding boxes. Does not take columns into account. This method is memoized
 * because it's assumed that it will frequently be called with the list of all symbols in
 * the paper, and that this sort will be costly.
 */
export const orderByPosition = defaultMemoize(
  (symbolIds: string[], entities: Entities) => {
    const sorted = [...symbolIds];
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
