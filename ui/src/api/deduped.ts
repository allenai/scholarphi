import { BoundingBox, Relationship as LegacyRelationship } from './types';

export type Nullable<T> = T | null;

/**
 * Types defined in here are for the entities-deduped endpoint,
 * and are intentionally less generic.
 * TODO: Replace existing entity type usages with these
 */

export interface DedupedEntityResponse {
  entities: Entity[];
  sharedSymbolData: { [dedupedMathml: string]: SharedSymbolData };
}

interface EntityBase {
  id: string;
  type: string; // type specifically?
  attributes: AttributesBase;
}

export type Entity = Citation | Symbol | Term | Equation | Sentence;

interface AttributesBase {
  bounding_boxes: BoundingBox[];
}

type Relationship = { id: string } | string;

export interface Citation extends EntityBase {
  type: 'citation';
  attributes: CitationAttributes;
}

interface CitationAttributes extends AttributesBase {
  paper_id: Nullable<string>;
}

export interface Symbol extends EntityBase {
  type: 'symbol';
  attributes: SymbolAttributes;
  relationships: SymbolRelationships;
}

interface SymbolAttributes extends AttributesBase {
  tex: Nullable<string>;
  type: "identifier" | "function" | "operator"; // TODO: This is null too with the deduped endpoint
  mathml: Nullable<string>;
  mathml_near_matches: string[];
  is_definition: Nullable<boolean>;
  diagram_label: Nullable<string>;
  /**
   * This is the ID to use when getting SharedSymbolData for this entity.
   */
  disambiguated_id: string;
  /**
   * Nicknames for the symbol extracted from the text, no more than a few words long.
   */
  nicknames: string[];
  /**
   * Other passages from the paper that help explain what this symbol means.
   */
  passages: string[];
}

export interface Term extends EntityBase {
  type: 'term';
  attributes: TermAttributes;
  relationships: TermRelationships;
}

interface TermAttributes extends AttributesBase {
  name: Nullable<string>;
  /**
   * A description of the type of this term (i.e., is it a protologism? A nonce?)
   */
  term_type: Nullable<string>;
  definitions: string[];
  definition_texs: string[];
  sources: string[];
  snippets: string[];
}

interface TermRelationships {
  sentence: Relationship;
  definition_sentences: Relationship[];
  snippet_sentences: Relationship[];
}

interface SymbolRelationships {
  equation: Relationship;
  sentence: Relationship;
  parent: Relationship;
  children: Relationship[];
  /**
   * Experimental feature: link to the sentences that contain each type of definition. For each
   * list of definitions in the symbol attributes (i.e., nicknames, definitions, defining
   * formulas, etc.), there should be one relationship to a the sentence containing that definition.
   * Therefore, each of these relationship lists should have the same length as the corresponding
   * list of definitions in the attributes.
   */
  nickname_sentences: Relationship[];
}

export interface Equation extends EntityBase {
  type: 'equation';
  attributes: EquationAttributes;
}

interface EquationAttributes extends AttributesBase {
  tex: Nullable<string>;
}

export interface Sentence extends EntityBase {
  type: "sentence";
  attributes: SentenceAttributes;
}

interface SentenceAttributes extends AttributesBase {
  text: Nullable<string>;
  tex: Nullable<string>;
  tex_start: Nullable<number>;
  tex_end: Nullable<number>;
}

interface SharedSymbolData {
  defining_formula_equations: string[];  // entity id
  defining_formulas: string[];  // tex-bearing formula text
  definition_sentences: string[];
  definition_texs: string[];
  definitions: string[];
  snippets: string[];  // tex-bearing sentence text
  snippet_sentences: string[];  // entity id
  sources: string[];
}

export function isCitation(entity: Entity): entity is Citation {
  return entity.type === "citation";
}

export function isSymbol(entity: Entity): entity is Symbol {
  return entity.type === "symbol";
}

export function isTerm(entity: Entity): entity is Term {
  return entity.type === "term";
}

export function isEquation(entity: Entity): entity is Equation {
  return entity.type === "equation";
}

export function isSentence(entity: Entity): entity is Sentence {
  return entity.type === "sentence";
}

export function toLegacyRelationship(rel: Relationship, type: string): LegacyRelationship {
  if (typeof rel === "string") {
    return {
      id: rel,
      type
    };
  }
  return {
    id: rel.id,
    type
  };
}
