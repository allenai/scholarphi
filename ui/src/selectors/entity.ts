import { Entities } from "../state";

export function selectedEntityType(
  selectedEntityId: string | null,
  entities: Entities | null
): string | null {
  if (
    selectedEntityId === null ||
    entities === null ||
    entities.byId[selectedEntityId] === undefined
  ) {
    return null;
  }
  return entities.byId[selectedEntityId].type;
}
