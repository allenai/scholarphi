import { Entities } from "../state";
import { isTerm } from "../types/api";
import { orderByPosition } from "./entity";

/**
 * Get a list of terms that match a set of terms, ordered by position in the document.
 */
export function matchingTerms(termIds: string[], entities: Entities) {
  const names = termIds
    .map((id) => entities.byId[id])
    .filter(isTerm)
    .map((t) => t.attributes.name);
  const matchingTermIds = entities.all
    .map((id) => entities.byId[id])
    .filter((e) => e !== undefined)
    .filter(isTerm)
    .filter((t) => names.indexOf(t.attributes.name) !== -1)
    .map((t) => t.id);
  return orderByPosition(matchingTermIds, entities);
}
