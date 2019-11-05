import { BoundingBox, Symbol } from "../types/api";
import { boundingBoxString } from "./annotation";

export function symbolKey(symbol: Symbol, location: BoundingBox) {
  return `${symbol.tex} ${boundingBoxString(location)}`;
}

/**
 * Get a list of symbols that match a provided 'symbol'. Currently, this performs a text match.
 * In the future, this might have more nuanced matching behavior.
 */
export function getMatchingSymbols(symbols: Symbol[], symbol: Symbol) {
  return symbols.filter(other => other.tex === symbol.tex);
}
