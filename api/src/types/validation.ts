import * as Joi from "@hapi/joi";

/**
 * Validation 'failAction' that reports the cause of error. Ideally, this should only be used in
 * development as it will leak details about the implementation of validation.
 * Adapted from https://github.com/hapijs/hapi/issues/3706#issuecomment-349765943
 */
export async function debugFailAction(_: any, __: any, err: any) {
  console.error(err);
  throw err;
}

export const s2Id = Joi.object({
  s2Id: Joi.string().pattern(/[a-f0-9]{40}/),
});

/**
 * arXiv ID needed to be wrapped in 'Joi.object' at the time of writing this as the contemporary
 * version of Hapi needed an object to use the 'alternatives' feature.
 */
export const arxivId = Joi.object({
  /*
   * See the arXiv documentation on valid identifiers here:
   * https://arxiv.org/help/arxiv_identifier.
   */
  arxivId: Joi.alternatives().try(
    /*
     * Current arXiv ID format.
     */
    Joi.string().pattern(/[0-9]{2}[0-9]{2}.[0-9]+(v[0-9]+)?/),
    /*
     * Older arXiv ID format.
     */
    Joi.string().pattern(
      /[a-zA-Z0-9-]+\.[A-Z]{2}\/[0-9]{2}[0-9]{2}[0-9]+(v[0-9]+)/
    )
  ),
});

const boundingBox = Joi.object({
  page: Joi.number().integer().min(0),
  source: Joi.string(),
  left: Joi.number(),
  top: Joi.number(),
  width: Joi.number(),
  height: Joi.number(),
}).options({ presence: "required" });

export let attributes = Joi.object({
  /*
   * Version is optional on POST requests, as it will otherwise can be set by default to the
   * latest version of data for a paper in the database.
   */
  version: Joi.number().optional(),
  /*
   * Source is required on both POST and PATCH requests. It is required for PATCH requests because
   * the database logs the 'source' of updated attributes and bounding boxes.
   */
  source: Joi.string().required(),
  bounding_boxes: Joi.array().items(boundingBox),
});

/**
 * Types for extended attributes for certain entity types. Unlike the base attributes defined
 * just above, which are required with every request, extended attributes:
 *
 * 1. Can be null or empty lists.
 * 2. Are defined with default values.
 *
 * The main reason it's important to permit null values and default values is that this
 * helps the API 'fill out' entity objects when expected data is missing in the database.
 * It's particularly important for loading list attributes from the database, where an
 * absence of data indicates an empty list, not a null value.
 */
const stringAttribute = Joi.string().allow(null).default(null);
const numberAttribute = Joi.number()
  .allow(null)
  .default(null)
  .options({ convert: true });
const stringListAttribute = Joi.array().items(Joi.string()).default([]);

/**
 * Expected attributes for specific entity types can be added by adding another item to
 * the 'switch' array (see 'citation' for an example). All added attributes should be
 * defined using the helper schemas above (e.g., stringAttribute, etc.).
 */
attributes = attributes
  /*
   * This switch refers to the 'type' attribute on an entity.
   */
  .when("..type", {
    switch: [
      {
        is: "citation",
        then: Joi.object().keys({
          paper_id: stringAttribute,
        }),
      },
      {
        is: "symbol",
        then: Joi.object().keys({
          mathml: stringAttribute,
          mathml_near_matches: stringListAttribute,
        }),
      },
      {
        is: "sentence",
        then: Joi.object().keys({
          text: stringAttribute,
          tex: stringAttribute,
          tex_start: numberAttribute,
          tex_end: numberAttribute,
        }),
      },
      {
        is: "term",
        then: Joi.object().keys({
          name: stringAttribute,
          definitions: stringListAttribute,
          sources: stringListAttribute,
        }),
      },
    ],
  })
  .unknown(false);

export let relationships = Joi.object();

/**
 * Validation rules for extensions to relationship rules for specific entity types.
 * All relationship provide default values, for the reasons described above in the comments
 * about extended attributes.
 */
const oneToOneRelationship = (type: string) => {
  return Joi.object({
    type: Joi.string().required().valid(type),
    id: Joi.string().required().allow(null),
  }).default({ type, id: null });
};
const oneToManyRelationship = (type: string) => {
  return Joi.array()
    .items(
      Joi.object({
        type: Joi.string().required().valid(type),
        id: Joi.string().required(),
      })
    )
    .default([]);
};

/**
 * Expected relationships for specific entity types can be added in the same way that they are
 * added to attributes (see comment above). All added attributes should be
 * defined using the helpers above (e.g., oneToOneRelationship).
 */
relationships = relationships
  .when("..type", {
    switch: [
      {
        is: "symbol",
        then: Joi.object().keys({
          sentence: oneToOneRelationship("sentence"),
          children: oneToManyRelationship("symbol"),
        }),
      },
    ],
  })
  .unknown(false);

export const entityPost = Joi.object({
  data: Joi.object({
    id: Joi.string().forbidden(),
    type: Joi.string().required(),
    /*
     * All defined attributes and relationships are required in a POST request.
     * However, as documented in https://github.com/hapijs/joi/issues/556#issuecomment-346912235,
     * it should be possible to mark individual properties as optional in POST requests by
     * adding ane explicit 'optional()' to that key.
     */
    attributes: attributes.required().options({ presence: "required" }),
    relationships: relationships.required().options({ presence: "required" }),
  }),
});

export const entityPatch = Joi.object({
  data: Joi.object({
    id: Joi.string().required(),
    type: Joi.string().required(),
    /*
     * Aside from the 'source' attribute, no single attribute or relationship is required on path.
     */
    attributes: attributes.required(),
    relationships,
  }),
  /*
   * Don't allow defaults for 'patch' data, as this will lead to resetting attributes and
   * relationships of the entity that were not specified by the client.
   */
}).options({ noDefaults: true });

export const loadedEntity = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().required(),
  attributes: attributes.required(),
  relationships: relationships.required(),
});
