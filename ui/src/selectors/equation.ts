import { defaultMemoize } from "reselect";
import { Entities } from "../state";
import { isSymbol } from "../types/api";
import { isTopLevelSymbol } from "./symbol";

export const equationSymbols = defaultMemoize(
  (equationId: string, entities: Entities) => {
    return entities.all
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter(isSymbol)
      .filter((s) => s.relationships.equation.id === equationId);
  }
);

export function equationTopLevelSymbols(
  equationId: string,
  entities: Entities
) {
  return equationSymbols(equationId, entities).filter((s) =>
    isTopLevelSymbol(s, entities)
  );
}
