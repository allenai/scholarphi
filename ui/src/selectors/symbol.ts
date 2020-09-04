import { defaultMemoize } from "reselect";
import { SymbolFilter } from "../FindBar";
import { Entities } from "../state";
import { isSymbol, Relationship, Symbol } from "../types/api";
import * as uiUtils from "../utils/ui";
import {
  adjacentContext,
  hasDefinition,
  inDefinition,
  orderByPosition,
  orderExcerpts,
} from "./entity";

export function diagramLabel(
  symbol: Symbol,
  includeNicknames?: boolean
): string | null {
  if (symbol.attributes.diagram_label !== null) {
    return symbol.attributes.diagram_label;
  }
  if (includeNicknames) {
    return uiUtils.sortByFrequency(symbol.attributes.nicknames)[0] || null;
  }
  return null;
}

export function isTopLevelSymbol(symbol: Symbol, entities: Entities) {
  return (
    symbol.relationships.parent.id === null ||
    entities.byId[symbol.relationships.parent.id] === undefined
  );
}

/**
 * Get the descendants of this symbol. Descendants are returned in breadth-first order. For
 * example, the subscripts of the symbol will be returned before the subscripts of the subscripts.
 */
export function descendants(symbolId: string, entities: Entities): Symbol[] {
  const descendantsList: Symbol[] = [];
  const entity = entities.byId[symbolId];
  const visit: Symbol[] = [];

  if (entity !== undefined && isSymbol(entity)) {
    visit.push(entity);
  }

  while (visit.length > 0) {
    const descendant = visit.shift() as Symbol;
    descendant.relationships.children
      .filter((c) => c.id !== null)
      .map((c) => entities.byId[c.id as string])
      .filter((e) => e !== undefined)
      .filter(isSymbol)
      .forEach((s) => {
        descendantsList.push(s);
        visit.push(s);
      });
  }

  return descendantsList;
}

export const symbolIds = defaultMemoize(
  (entities: Entities, from?: string[]) => {
    return entities.all
      .filter((eId) => isSymbol(entities.byId[eId]))
      .filter((id) => from === undefined || from.indexOf(id) !== -1);
  }
);

/**
 * Get a list of IDs of all symbols that with similar MathML. Returned list of symbols will
 * be in the order the symbols appear in the document. MathML is used for matching rather than
 * TeX as MathML is more likely to yield precise matches, having been normalized by the backend.
 */
export function matchingSymbols(
  symbolIdOrIds: string | string[],
  entities: Entities,
  symbolFilters?: SymbolFilter[]
) {
  if (typeof symbolIdOrIds === "string") {
    return symbolsMatchingSingleSymbol(symbolIdOrIds, entities, symbolFilters);
  } else {
    const matchingSymbolIds = symbolIdOrIds
      .map((id) => symbolsMatchingSingleSymbol(id, entities, symbolFilters))
      .flat();
    const uniqueIds = matchingSymbolIds.reduce((dict, id) => {
      dict[id] = true;
      return dict;
    }, {} as { [id: string]: any });
    return matchingSymbolIds.filter((id) => uniqueIds[id]);
  }
}

const symbolsMatchingSingleSymbol = defaultMemoize(
  (symbolId: string, entities: Entities, symbolFilters?: SymbolFilter[]) => {
    const symbol = entities.byId[symbolId] as Symbol;

    /*
     * Get ordered list of all symbols for sorting the matching symbols later. Sort all of the
     * symbols instead of sorting the matching symbols so that the sort can be run once for all
     * calls to this method and memoized.
     */
    const orderedSymbolIds = orderByPosition(symbolIds(entities), entities);

    return orderedSymbolIds
      .map((sId) => entities.byId[sId])
      .map((s) => s as Symbol)
      .filter((otherSymbol) => {
        if (
          otherSymbol.attributes.mathml === null ||
          otherSymbol.attributes.mathml === ""
        ) {
          return false;
        }
        /*
         * If no filters were provided, or if no filters activated or deactivated, every match
         * returned by the backend is considered valid.
         */
        if (
          !symbolFilters ||
          !symbolFilters.some((f) => f.active !== undefined)
        ) {
          return otherSymbol.attributes.mathml === symbol.attributes.mathml;
        }
        return symbolFilters.some(
          (f) => otherSymbol.attributes.mathml === f.symbol.attributes.mathml
        );
      })
      .map((s) => s.id);
  }
);

/**
 * Determine if 'symbol1' is a child of 'symbol2'.
 */
export function isChild(symbol1: Symbol, symbol2: Symbol) {
  return symbol2.relationships.children.some((c) => c.id === symbol1.id);
}

/**
 * Determine if 'symbol1' is a descendant of 'symbol2'.
 */
export function isDescendant(
  symbol1: Symbol,
  symbol2: Symbol,
  entities: Entities
) {
  let parent: Relationship = symbol1.relationships.parent;
  while (parent && parent.id !== null) {
    const parentEntity = entities.byId[parent.id];
    if (parentEntity !== undefined && isSymbol(parentEntity)) {
      if (parentEntity === symbol2) {
        return true;
      }
      parent = parentEntity.relationships.parent;
    } else {
      break;
    }
  }
  return false;
}

/**
 * Get a list of the unique MathML equations used in this set of symbols. Guaranteed to match the
 * order they were found when iterating through the list sequentially. Therefore if you sort the
 * the symbols, the MathML returned will match that sort order.
 */
export function symbolMathMls(symbolIds: string[], entities: Entities) {
  const uniqueMathMls: string[] = [];
  symbolIds.forEach((sId) => {
    const mathMl = (entities.byId[sId] as Symbol).attributes.mathml;
    if (mathMl !== null && uniqueMathMls.indexOf(mathMl) === -1) {
      uniqueMathMls.push(mathMl);
    }
  });
  return uniqueMathMls;
}

export function definitionsAndNicknames(
  symbolIds: string[],
  entities: Entities
) {
  const symbols = symbolIds
    .map((id) => entities.byId[id])
    .filter((e) => e !== undefined)
    .filter(isSymbol);
  const excerpts = symbols.map((s) => s.attributes.definitions).flat();
  const contexts = symbols
    .map((s) => s.relationships.definition_sentences)
    .flat();
  excerpts.push(...symbols.map((s) => s.attributes.nicknames).flat());
  contexts.push(
    ...symbols.map((s) => s.relationships.nickname_sentences).flat()
  );
  return orderExcerpts(excerpts, contexts, entities);
}

export function definingFormulas(symbolIds: string[], entities: Entities) {
  const symbols = symbolIds
    .map((id) => entities.byId[id])
    .filter((e) => e !== undefined)
    .filter(isSymbol);
  const formulas = symbols.map((s) => s.attributes.defining_formulas).flat();
  const contexts = symbols
    .map((s) => s.relationships.defining_formula_equations)
    .flat();
  return orderExcerpts(formulas, contexts, entities);
}

/**
 * Get definition that appears right above an entity. (Don't include)
 * a definition where the entity appears.
 */
export function adjacentNickname(
  symbolId: string,
  entities: Entities,
  where: "before" | "after"
) {
  const symbol = entities.byId[symbolId];
  if (symbol === undefined || !isSymbol(symbol)) {
    return null;
  }

  const { nicknames } = symbol.attributes;
  const contexts = symbol.relationships.nickname_sentences;
  if (nicknames.length === 0 || contexts.length === 0) {
    return null;
  }

  const ordered = orderExcerpts(nicknames, contexts, entities);
  const sentenceId = symbol.relationships.sentence.id;
  return adjacentContext(sentenceId, entities, ordered, where);
}

export function descendantHasDefinition(symbolId: string, entities: Entities) {
  return descendants(symbolId, entities).some((s) =>
    hasDefinition(s.id, entities)
  );
}

/**
 * Determine whether an underline should show for a symbol. An underline should show if
 * it's not selected, there's a definition for the symbol, it isn't in a definition,
 * and none of its ancestor symbols will be underlined.
 */
export function shouldUnderline(symbolId: string, entities: Entities) {
  const symbol = entities.byId[symbolId];
  if (
    symbol === undefined ||
    !isSymbol(symbol) ||
    !hasDefinition(symbolId, entities) ||
    inDefinition(symbolId, entities)
  ) {
    return false;
  }
  let ancestorId = symbol.relationships.parent.id;
  while (ancestorId !== null) {
    const ancestor = entities.byId[ancestorId];
    if (ancestor === undefined || !isSymbol(ancestor)) {
      break;
    }
    if (shouldUnderline(ancestor.id, entities)) {
      return false;
    }
    ancestorId = ancestor.relationships.parent.id;
  }
  return true;
}
