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
      symbols.filter(s => s.mathml === match.mathMl)
    );
  }
  return matchingSymbols;
}
