import { MathMl, Symbol } from "../types/api";

/**
 * Return an ordered list of symbols that match this one. Currently other symbols that have the
 * same MathML, or an overlapping subtree. Exact matches are returned first.
 */
export function matchingSymbols(
  symbol: Symbol,
  symbols: Symbol[],
  allMathMl: MathMl[]
) {
  let matchingSymbols: Symbol[] = [];

  const mathMl = allMathMl.filter(m => m.mathMl === symbol.mathml)[0];
  if (mathMl === undefined) {
    return matchingSymbols;
  }

  for (const match of mathMl.matches) {
    matchingSymbols = matchingSymbols.concat(
      symbols.filter(s => s.mathml === match.mathMl && s !== symbol)
    );
  }
  return matchingSymbols;
}

/**
 * Get the first symbol from the set with exactly-matching MathML.
 */
export function firstMatchingSymbol(symbol: Symbol, symbols: Symbol[]) {
  const matchingSymbols = symbols.filter(
    s => s.mathml === symbol.mathml && s !== symbol
  );
  if (matchingSymbols.length >= 1) {
    return sortSymbolsByPosition(matchingSymbols)[0];
  }
  return null;
}

/**
 * Find the set of most similar symbols to this symbol based on their MathML, and return the
 * symbol from that set that appears first in the paper.
 */
export function firstMostSimilarSymbol(
  symbol: Symbol,
  symbols: Symbol[],
  allMathMl: MathMl[]
) {
  const rankedSymbols = matchingSymbols(symbol, symbols, allMathMl);
  if (rankedSymbols.length >= 1) {
    const mostSimilarMathMl = rankedSymbols[0].mathml;
    const mostSimilarSymbols = symbols.filter(
      s => s.mathml === mostSimilarMathMl && s !== symbol
    );
    return mostSimilarSymbols[0];
  }
  return null;
}

/**
 * Get a list of the unique MathML equations used in this set of symbols. Guaranteed to match the
 * order they were found when iterating through the list sequentially. Therefore if you sort the
 * the symbols, the MathML returned will match that sort order.
 */
export function symbolMathMls(symbols: Symbol[]) {
  const uniqueMathMls = [];
  for (const symbol of symbols) {
    if (uniqueMathMls.indexOf(symbol.mathml) === -1) {
      uniqueMathMls.push(symbol.mathml);
    }
  }
  return uniqueMathMls;
}

/**
 * Sort symbols by their position in the paper. The first symbols will be those that
 * appear at the top of the first pages.
 */
function sortSymbolsByPosition(symbols: Symbol[]) {
  const sortedSymbols = [...symbols];
  sortedSymbols.sort((s1, s2) => {
    if (s1.bounding_box.page !== s2.bounding_box.page) {
      return s1.bounding_box.page - s2.bounding_box.page;
    }
    return s2.bounding_box.top - s1.bounding_box.top;
  });
  return sortedSymbols;
}
