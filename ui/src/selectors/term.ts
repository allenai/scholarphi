import { Entities } from "../state";
import { isTerm, Term } from "../types/api";
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
    .filter((t) => t.attributes.bounding_boxes.length > 0)
    .map((t) => t.id);
  return orderByPosition(matchingTermIds, entities);
}

/**
 * A summary of term data suitable for logging. This set of properties should
 * be fast to compute (i.e., mostly of property accesses).
 */
export function termLogData(term: Term) {
  return {
    id: term.id,
    name: term.attributes.name,
    numDefinitions: term.attributes.definitions.length,
    numUsages: term.attributes.snippets.length,
    pages: term.attributes.bounding_boxes.map((b) => b.page),
  };
}
