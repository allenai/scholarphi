import { BoundingBox, Symbol } from "../types/api";
import { boundingBoxString } from "./annotation";

export function symbolKey(symbol: Symbol, location: BoundingBox) {
  return `${symbol.tex} ${boundingBoxString(location)}`;
}
