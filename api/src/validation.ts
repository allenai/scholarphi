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

const relationship = (options: { nullable?: boolean; type: string }) => {
  return Joi.object({
    type: Joi.string().required().valid(options.type),
    id: options.nullable
      ? Joi.string().required().allow(null)
      : Joi.string().required(),
  });
};

/**
 * Expected attributes for new entity types can be added by adding another item to
 * the 'switch' array (see 'citation' for an example).
 */
const attributes = Joi.object({
  version: Joi.number(),
  /*
   * Source is required on both POST and PATCH requests. It is required for PATCH requests because
   * the database logs the 'source' of updated attributes and bounding boxes.
   */
  source: Joi.string().required(),
  bounding_boxes: Joi.array().items(boundingBox),
})
  /*
   * This switch refers to the { data: { type: "..." } } property on a request.
   */
  .when("/data.type", {
    switch: [
      {
        is: "citation",
        then: Joi.object().keys({
          paper_id: Joi.string(),
        }),
      },
      {
        is: "symbol",
        then: Joi.object().keys({
          mathml: Joi.string(),
          mathml_near_matches: Joi.array().items(Joi.string()),
          sentence: Joi.string().allow(null),
        }),
      },
      {
        is: "sentence",
        then: Joi.object().keys({
          text: Joi.string(),
          tex_start: Joi.number(),
          tex_end: Joi.number(),
        }),
      },
    ],
  })
  .unknown(false);

/**
 * Expected relationships for new entity types can be added by adding another item to
 * the 'switch' array (see 'symbol' for an example).
 */
const relationships = Joi.object()
  .when("/data.type", {
    switch: [
      {
        is: "symbol",
        then: Joi.object().keys({
          sentence: relationship({ type: "sentence", nullable: true }),
          children: Joi.array().items(relationship({ type: "symbol" })),
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
});
