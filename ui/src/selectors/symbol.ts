import { defaultMemoize } from "reselect";
import { MathMls, Symbols } from "../state";
import { BoundingBox } from "../types/api";

/**
 * Get a list of IDs of all symbols that with similar MathML. Returned list of symbols will
 * be in the order the symbols appear in the document.
 */
export const matchingSymbols = defaultMemoize(
  (symbolId: string, symbols: Symbols, allMathMl: MathMls) => {
    /*
     * Get ordered list of all symbols for sorting the matching symbols later. Sort all of the
     * symbols instead of sorting the matching symbols so that the sort can be run once for all
     * calls to this method and memoized.
     */
    const orderedSymbolIds = orderByPosition(symbols.all, symbols);

    const mathMl = allMathMl.byId[symbols.byId[symbolId].mathml];
    const matchingSymbolIds = mathMl.matches
      .map((match) => allMathMl.byId[match.mathMl].symbols)
      .flat();
    const matchingSymbolIdSet = matchingSymbolIds.reduce((map, sId) => {
      map[sId] = true;
      return map;
    }, {} as { [sId: string]: boolean });
    return orderedSymbolIds.filter((sId) => matchingSymbolIdSet[sId]);
  }
);

/**
 * Get a list of the unique MathML equations used in this set of symbols. Guaranteed to match the
 * order they were found when iterating through the list sequentially. Therefore if you sort the
 * the symbols, the MathML returned will match that sort order.
 */
export function symbolMathMlIds(
  symbolIds: string[],
  symbols: Symbols,
  mathMls: MathMls
) {
  const uniqueMathMlIds: string[] = [];
  symbolIds.forEach((sId) => {
    const mathMlId = mathMls.byId[symbols.byId[sId].mathml].id;
    if (uniqueMathMlIds.indexOf(mathMlId) === -1) {
      uniqueMathMlIds.push(mathMlId);
    }
  });
  return uniqueMathMlIds;
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
  (symbolIds: string[], symbols: Symbols) => {
    const sorted = [...symbolIds];
    sorted.sort((sId1, sId2) => {
      const symbol1Boxes = symbols.byId[sId1].bounding_boxes;
      const symbol1TopBox = symbol1Boxes.sort(compareBoxes)[0];
      const symbol2Boxes = symbols.byId[sId2].bounding_boxes;
      const symbol2TopBox = symbol2Boxes.sort(compareBoxes)[0];
      return compareBoxes(symbol1TopBox, symbol2TopBox);
    });
    return sorted;
  }
);
