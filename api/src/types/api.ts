/**
 * The design of the data types for responses roughly follow the conventions of JSON:API:
 * See the specification at https://jsonapi.org/format/.
 *
 * In addition, field names are written using underscores, not camelCase.
 *
 * These data structures roughly resemble the schemas in the database. A definition of the schemas along
 * with documentation should reside in 'data-processing/common/models.py' or thereabouts.
 *
 * This file was intended to be copied and pasted into other projects that need to know the types
 * returned from the API. Because of this, all types are exported, so that when this file is copied
 * into other projects, all of the types are available to the client code.
 */

export interface PaperIdWithCounts {
  s2Id: string;
  arxivId?: string;
  extractedSymbolCount: number;
  extractedCitationCount: number;
}

/**
 * Format of returned papers loosely follows that for the S2 API:
 * https://api.semanticscholar.org/
 */
export interface Paper {
  s2Id: string;
  abstract: string;
  authors: Author[];
  title: string;
  url: string;
  venue: string;
  year: number | null;
  influentialCitationCount?: number;
  citationVelocity?: number;
}

export interface Author {
  id: string;
  name: string;
  url: string;
}

export interface EntityGetResponse {
  data?: Entity[];
}

/**
 * Use type guards (e.g., 'isSymbol') to distinguish between types of entities.
 */
export type Entity = GenericEntity | Symbol | Term | Citation | Sentence;

/**
 * All entity specifications should extend BaseEntity. To make specific relationship properties
 * known to TypeScript, define a relationships type (e.g., see 'SymbolRelationships'). Otherwise,
 * set the relationships property type to '{}'.
 */
export interface BaseEntity {
  /**
   * Entity IDs are guaranteed to be unique, both within and across papers.
   */
  id: string;
  type: string;
  attributes: BaseEntityAttributes;
  relationships: Relationships;
}

/**
 * All entities must define at least these attributes.
 */
export interface BaseEntityAttributes {
  version: number;
  source: string;
  bounding_boxes: BoundingBox[];
}

/**
 * List of base entity attribute keys. Update this as 'BaseEntityAttributes' updates. This list
 * lets a program check statically whether an attribute on an entity is a custom attribute.
 */
export const BASE_ENTITY_ATTRIBUTE_KEYS = [
  "id",
  "type",
  "version",
  "source",
  "bounding_boxes",
];

/**
 * While it is not described with types here, Relationships must be key-value pairs, where the values
 * are either 'Relationship' or a list of 'Relationship's.
 */
export interface Relationships {}

export interface Relationship {
  type: string;
  id: string | null;
}

export function isRelationship(o: any): o is Relationship {
  return typeof o.type === "string" && typeof o.id === "string";
}

/**
 * An entity where no information is known about its type, and hence attributes and
 * relationships specific to that entity type are not available. This type is defined to provide
 * *some* small amount of type checking for unknown and new types of entities.
 */
export interface GenericEntity extends BaseEntity {
  attributes: BaseEntityAttributes & GenericAttributes;
  relationships: GenericRelationships;
}

/**
 * When posting an entity, an 'id' need not be included, nor a version tag.
 */
export interface EntityCreatePayload {
  data: EntityCreateData;
}

export interface EntityCreateData {
  type: string;
  attributes: Omit<BaseEntityAttributes, "version"> & GenericAttributes;
  relationships: GenericRelationships;
}

/**
 * When patching an entity, the 'type' and 'id' are required. The 'source' attribute is also
 * required. All modified entities and specified bounding boxes and data will be assigned the
 * the provided 'source' value.
 */
export interface EntityUpdatePayload {
  data: EntityUpdateData;
}

export interface EntityUpdateData {
  id: string;
  type: string;
  attributes: Pick<GenericAttributes, "source"> & Partial<GenericAttributes>;
  relationships?: Partial<GenericRelationships>;
}

/**
 * In general, attributes can have values of type 'string | number | string[] | null | undefined'. Because
 * we're doing a type intersection with BaseEntityAttributes above to define the attributes for
 * a BasicEntity (where some properties are of other types like BoundingBox[]), 'any' is used as
 * the type of value here, even though the types of GenericAttributes values should be restricted.
 */
export interface GenericAttributes {
  [key: string]: any;
}

export type GenericRelationships = {
  [key: string]: Relationship | Relationship[];
};

/**
 * 'Symbol' is an example of how to define a new entity type with custom attributes
 * and relationships. Note that a full custom entity definition includes:
 * * an 'attributes' type
 * * a 'relationships' type
 * * a type-guard (i.e., an 'is<Entity>' function)
 */
export interface Symbol extends BaseEntity {
  type: "symbol";
  attributes: SymbolAttributes;
  relationships: SymbolRelationships;
}

export interface SymbolAttributes extends BaseEntityAttributes {
  tex: string | null;
  mathml: string | null;
  mathml_near_matches: string[];
  is_definition: boolean | null;
  diagram_label: string | null;
  /**
   * Nicknames for the symbol extracted from the text, no more than a few words long.
   */
  nicknames: string[];
  /**
   * A description of what a symbol means, in prose (though can contain formulae). May either
   * describe the concept that the symbol represents (i.e., 'beta is the bias term') or
   * analytic assertions (i.e., 'beta takes on values between 0 and 1').
   */
  definitions: string[];
  /**
   * Formulas from the paper that serve as a formal definition of the symbol.
   */
  defining_formulas: string[];
  /**
   * Other passages from the paper that help explain what this symbol means.
   */
  passages: string[];
  /**
   * An extracted TeX snippet that shows the symbol in context.
   */
  snippets: string[];
}

export interface SymbolRelationships {
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
  definition_sentences: Relationship[];
  defining_formula_equations: Relationship[];
  snippet_sentences: Relationship[];
}

/**
 * Type guards for entities should only have to check the 'type' attribute.
 */
export function isSymbol(entity: Entity): entity is Symbol {
  return entity.type === "symbol";
}

export interface Term extends BaseEntity {
  type: "term";
  attributes: TermAttributes;
  relationships: TermRelationships;
}

export interface TermAttributes extends BaseEntityAttributes {
  name: string | null;
  /**
   * A description of the type of this term (i.e., is it a protologism? A nonce?)
   */
  term_type: string | null;
  /**
   * List of prose passages that describe the meaning of the term.
   */
  definitions: string[];
  /**
   * List of passages of TeX. Each item should correspond to the definition at the same index
   * from 'definitions', assuming the definition was extracted from TeX; otherwise the item
   * should be set to 'null'.
   */
  definition_texs: string[];
  /**
   * Tag indicating the source of the definition. For example, the tag might indicate that the
   * definition came from an external glossary, or from a definition extractor. There should be one
   * source for each definition in 'definitions'.
   */
  sources: string[];
  /**
   * Additional passages that help explain what this term means.
   */
  snippets: string[];
  /**
   * Additional metadata for this term. For instance, one tag could be whether a term has been
   * identified as a 'key term', to indicate that the term should be displayed in a special way.
   */
  tags: string[];
}

export interface TermRelationships {
  sentence: Relationship;
  definition_sentences: Relationship[];
  snippet_sentences: Relationship[];
}

export function isTerm(entity: Entity): entity is Term {
  return entity.type === "term";
}

export interface Citation extends BaseEntity {
  type: "citation";
  attributes: CitationAttributes;
  relationships: {};
}

export interface CitationAttributes extends BaseEntityAttributes {
  paper_id: string | null;
}

export function isCitation(entity: Entity): entity is Citation {
  return entity.type === "citation";
}

export interface Equation extends BaseEntity {
  type: "equation";
  attributes: BaseEntityAttributes;
  relationships: {};
}

export function isEquation(entity: Entity): entity is Equation {
  return entity.type === "equation";
}

export interface Sentence extends BaseEntity {
  type: "sentence";
  attributes: SentenceAttributes;
  relationships: {};
}

export interface SentenceAttributes extends BaseEntityAttributes {
  text: string | null;
  tex: string | null;
  tex_start: number | null;
  tex_end: number | null;
}

export function isSentence(entity: Entity): entity is Sentence {
  return entity.type === "sentence";
}

/**
 * Matches the schema of the data in the 'boundingbox' table in the database.  'left', 'top',
 * 'width', and 'height' are expressed in ratios to the page width and height, rather than
 * absolute coordinates.
 *
 * For example, a bounding box is expressed as
 * {
 *   left: .1,
 *   right: .1,
 *   width: .2,
 *   height: .05
 * }
 *
 * if its absolute position is (50px, 100px), its width is (100px), and its
 * height is (50px) on a page with dimensions (W = 500px, H = 1000px).
 *
 * This representation of coordinates was chosen due to constraints in the design of the data
 * processing pipeline. More specifically, it's easier to extract ratio coordinates than absolute
 * coordinates when processing PDFs and PostScript files with Python.
 */
export interface BoundingBox {
  source: string;
  /**
   * Page indexes start at 0.
   */
  page: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PaperWithEntityCounts {
  s2_id: string;
  arxiv_id?: string;
  citations: string;
  symbols: string;
}

/**
 * Data for a logging event.
 */
export interface LogEntryCreatePayload {
  username: string | null;
  level: string;
  event_type: string | null;
  data: any;
}
