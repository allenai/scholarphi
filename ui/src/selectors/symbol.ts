import { MathMls, Symbols } from "../state";
import { BoundingBox } from "../types/api";

/**
 * Get a list of IDs of all symbols that with similar MathML.
 */
export function matchingSymbols(
  symbolId: string,
  symbols: Symbols,
  allMathMl: MathMls,
  exact?: boolean
) {
  if (exact === true) {
    return allMathMl.byId[symbols.byId[symbolId].mathml].symbols;
  } else {
    const mathMl = allMathMl.byId[symbols.byId[symbolId].mathml];
    return mathMl.matches
      .map(match => allMathMl.byId[match.mathMl].symbols)
      .flat();
  }
}

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
  symbolIds.forEach(sId => {
    const mathMlId = mathMls.byId[symbols.byId[sId].mathml].id;
    if (uniqueMathMlIds.indexOf(mathMlId) === -1) {
      uniqueMathMlIds.push(mathMlId);
    }
  });
  return uniqueMathMlIds;
}

/**
 * Order a list of symbol IDs by which ones appear first in the paper, using the position of
 * the symbol bounding boxes. Does not take columns into account.
 */
export function orderByPosition(symbolIds: string[], symbols: Symbols) {
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

/**
 * Comparator for sorting boxes from highest position in the paper to lowest.
 */
function compareBoxes(box1: BoundingBox, box2: BoundingBox) {
  if (box1.page !== box2.page) {
    return box1.page - box2.page;
  }
  return box2.top - box1.top;
}
