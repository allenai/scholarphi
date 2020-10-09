import { defaultMemoize } from "reselect";
import { SymbolFilter } from "../FindBar";
import { Entities } from "../state";
import { isSentence, isSymbol, Relationship, Symbol } from "../types/api";
import {
  adjacentContext,
  adjacentDefinition,
  comparePosition,
  hasDefinition,
  inDefinition,
  orderByPosition,
  orderExcerpts,
} from "./entity";

export function diagramLabel(
  symbol: Symbol,
  entities: Entities,
  explicitLabelsOnly?: boolean
): string | null {
  if (symbol.attributes.diagram_label !== null) {
    if (symbol.attributes.diagram_label === "SKIP") {
      return null;
    }
    return symbol.attributes.diagram_label;
  }
  if (!explicitLabelsOnly) {
    const definition = nearbyDefinition(symbol.id, entities, true);
    return definition ? definition.excerpt : null;
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
        if (otherSymbol.attributes.bounding_boxes.length === 0) {
          return false;
        }
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

/**
 * Get the first definition or nickname right before the appearance of the symbol, if
 * possible. If not possible, get the first definition or nickname right after the appearance
 * of the symbol. If 'includeThisAppearance' is set, the sentence that the symbol appears
 * will be returned, if it is a definition.
 */
export function nearbyDefinition(
  symbolId: string,
  entities: Entities,
  includeThisAppearance?: boolean
) {
  const symbol = entities.byId[symbolId];
  if (symbol === undefined || !isSymbol(symbol)) {
    return null;
  }
  if (includeThisAppearance && inDefinition(symbol.id, entities)) {
    for (let i = 0; i < symbol.attributes.definitions.length; i++) {
      const context = symbol.relationships.definition_sentences[i];
      if (context === undefined || context.id === null) {
        continue;
      }
      const sentence = entities.byId[context.id];
      if (sentence === undefined || !isSentence(sentence)) {
        continue;
      }
      if (
        sentence.id === symbol.relationships.sentence.id &&
        symbol.attributes.definitions[i] !== undefined
      ) {
        return {
          excerpt: symbol.attributes.definitions[i],
          contextEntity: sentence,
        };
      }
    }
  }
  const dBefore = adjacentDefinition(symbolId, entities, "before");
  const nBefore = adjacentNickname(symbolId, entities, "before");
  if (dBefore && nBefore) {
    return comparePosition(dBefore.contextEntity, nBefore.contextEntity) > 0
      ? dBefore
      : nBefore;
  }
  if (dBefore) {
    return dBefore;
  }
  if (nBefore) {
    return nBefore;
  }
  const dAfter = adjacentDefinition(symbolId, entities, "after");
  const nAfter = adjacentNickname(symbolId, entities, "after");
  if (dAfter && nAfter) {
    return comparePosition(dAfter.contextEntity, nAfter.contextEntity) < 0
      ? dAfter
      : nAfter;
  }
  if (dAfter) {
    return dAfter;
  }
  if (nAfter) {
    return nAfter;
  }
  return null;
}

/**
 * A summary of symbol data suitable for logging. This set of properties should
 * be fast to compute, comprising mostly of property accesses.
 */
export function symbolLogData(symbol: Symbol) {
  return {
    id: symbol.id,
    name: symbol.attributes.tex,
    numNicknames: symbol.attributes.nicknames.length,
    numDefinitions: symbol.attributes.definitions.length,
    numFormulas: symbol.attributes.defining_formulas.length,
    numUsages: symbol.attributes.snippets.length,
    numChildren: symbol.relationships.children.length,
    hasParent: symbol.relationships.parent.id !== null,
    pages: symbol.attributes.bounding_boxes.map((b) => b.page),
  };
}
