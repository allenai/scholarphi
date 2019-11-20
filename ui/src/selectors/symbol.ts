import { Symbol } from "../types/api";

/**
 * Get a list of symbols that match a provided 'symbol'. Currently, this performs a text match.
 * In the future, this might have more nuanced matching behavior.
 */
export function getMatchingSymbols(symbols: Symbol[], symbol: Symbol) {
  return symbols.filter(other => other.mathml === symbol.mathml);
}
