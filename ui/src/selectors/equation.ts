import { defaultMemoize } from "reselect";
import { Entities } from "../state";
import { isSymbol } from "../types/api";

export const equationSymbols = defaultMemoize(
  (equationId: string, entities: Entities) => {
    return entities.all
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter(isSymbol)
      .filter((s) => s.relationships.equation.id === equationId);
  }
);
