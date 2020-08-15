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

export function nickname(symbol: Symbol): string | null {
  return symbol.attributes.nicknames[0] || null;
}

export function isTopLevelSymbol(symbol: Symbol, entities: Entities) {
  return (
    symbol.relationships.parent.id === null ||
    entities.byId[symbol.relationships.parent.id] === undefined
  );
}

/**
 * Get the descendants of this symbol. Descendants are returned in breadth-first order. For
 * example, the subscripts of the symbol will be returned before the subscripts of the subscripts.
 */
export function descendants(symbolId: string, entities: Entities): Symbol[] {
  const descendantsList: Symbol[] = [];
  const entity = entities.byId[symbolId];
  const visit: Symbol[] = [];

  if (entity !== undefined && isSymbol(entity)) {
    visit.push(entity);
  }

  while (visit.length > 0) {
    const descendant = visit.shift() as Symbol;
    descendant.relationships.children
      .filter((c) => c.id !== null)
      .map((c) => entities.byId[c.id as string])
      .filter((e) => e !== undefined)
      .filter(isSymbol)
      .forEach((s) => {
        descendantsList.push(s);
        visit.push(s);
      });
  }

  return descendantsList;
}

/**
 * Return all sentences containing a list of symbols.
 */
export function symbolSentences(
  entityIds: string[],
  entities: Entities
): Sentence[] {
  return entityIds
    .map((id) => entities.byId[id])
    .filter((e) => e !== undefined)
    .filter(isSymbol)
    .map((s) => s.relationships.sentence.id)
    .filter((sentId) => sentId !== null)
    .map((sentId) => entities.byId[sentId as string])
    .filter((sent) => sent !== undefined)
    .filter(isSentence);
}

export const symbolIds = defaultMemoize(
  (entities: Entities, from?: string[]) => {
    return entities.all
      .filter((eId) => isSymbol(entities.byId[eId]))
      .filter((id) => from === undefined || from.indexOf(id) !== -1);
  }
);

/**
 * Get a list of IDs of all symbols that with similar MathML. Returned list of symbols will
 * be in the order the symbols appear in the document. MathML is used for matching rather than
 * TeX as MathML is more likely to yield precise matches, having been normalized by the backend.
 */
export function matchingSymbols(
  symbolIdOrIds: string | string[],
  entities: Entities,
  symbolFilters?: SymbolFilter[]
) {
  if (typeof symbolIdOrIds === "string") {
    return symbolsMatchingSingleSymbol(symbolIdOrIds, entities, symbolFilters);
  } else {
    const matchingSymbolIds = symbolIdOrIds
      .map((id) => symbolsMatchingSingleSymbol(id, entities, symbolFilters))
      .flat();
    const uniqueIds = matchingSymbolIds.reduce((dict, id) => {
      dict[id] = true;
      return dict;
    }, {} as { [id: string]: any });
    return matchingSymbolIds.filter((id) => uniqueIds[id]);
  }
}

const symbolsMatchingSingleSymbol = defaultMemoize(
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
        if (
          otherSymbol.attributes.mathml === null ||
          otherSymbol.attributes.mathml === ""
        ) {
          return false;
        }
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
        return symbolFilters.some(
          (f) => otherSymbol.attributes.mathml === f.symbol.attributes.mathml
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
    } else {
      break;
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
