/**
 * See the comments about the design choice in storing data in relational stores in 'types/state.ts'
 */
import { RelationalStore } from "../state";

export function createRelationalStore<T>(): RelationalStore<T> {
  return { all: [], byId: {} };
}

/**
 * Convert an array into a relational store with the specified key as an ID.
 */
export function createRelationalStoreFromArray<T>(
  array: any[],
  idKey: string
): RelationalStore<T> {
  const allIds = array
    .map((item) => item[idKey])
    .filter((key) => typeof key === "string");
  const itemsById = array
    .filter((item) => allIds.indexOf(item[idKey]) !== -1)
    .reduce((byId, item) => {
      byId[item[idKey]] = item;
      return byId;
    }, {});
  return {
    all: allIds,
    byId: itemsById,
  };
}

/**
 * Add an item to a relational store. Returns a new relational store with a new 'byId' object
 * and a new 'all' array. Assumes the item keyed by 'id' is not yet in the store.
 */
export function add<T>(
  store: RelationalStore<T>,
  id: string,
  item: T
): RelationalStore<T> {
  return {
    ...store,
    byId: {
      ...store.byId,
      [id]: item,
    },
    all: [...store.all.concat(id)],
  };
}

/**
 * Update an item in the relational store. Returns a new relational store with a new 'byId'
 * object, but the same 'all' array. Assumes the item keyed by 'id' is already in the store.
 */
export function update<T>(
  store: RelationalStore<T>,
  id: string,
  item: T
): RelationalStore<T> {
  return {
    ...store,
    byId: {
      ...store.byId,
      [id]: item,
    },
  };
}

/**
 * Deletes an item from the relational store. Returns a new store with a new 'byId' object,
 * and a new 'all' array. Assumes the item keyed by 'id' is already in the store.
 */
export function del<T>(
  store: RelationalStore<T>,
  id: string
): RelationalStore<T> {
  const all = store.all.filter((itemId) => itemId !== id);
  const byId = { ...store.byId };
  delete byId[id];
  return { all, byId };
}
