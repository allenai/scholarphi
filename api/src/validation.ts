import * as Joi from "@hapi/joi";

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

/**
 * Validation for a bounding box.
 */
const boundingBoxes = Joi.array().items(
  Joi.object({
    page: Joi.number().integer().min(0).required(),
    left: Joi.number().required(),
    top: Joi.number().required(),
    width: Joi.number().required(),
    height: Joi.number().required(),
  })
);

const relationship = Joi.object({
  type: Joi.string().required(),
  id: Joi.string().required().allow(null),
});

const relationships = Joi.object({
  arg: Joi.string(),
  value: Joi.alternatives(relationship, Joi.array().items(relationship)),
});

/**
 * Validation for entity POST request.
 */
export const entityPostData = Joi.object({
  type: Joi.string().required(),
  attributes: Joi.object({
    version: Joi.number().optional(),
    source: Joi.string().required(),
    bounding_boxes: boundingBoxes.required(),
    /**
     * 'arg' and 'value' check arbitrary other attribute keys.
     */
    arg: Joi.string(),
    value: Joi.alternatives(
      Joi.string(),
      Joi.number(),
      Joi.array().items(Joi.string())
    ).allow(null),
  }).required(),
  relationships: relationships.required(),
});

/**
 * Validation for entity PATCH request. This is the same as 'entityPostData' with the exception that
 * 'id' is required, and all other properties are optional.
 */
export const entityPatchData = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().required(),
  attributes: Joi.object({
    version: Joi.number().optional(),
    source: Joi.string().optional(),
    bounding_boxes: boundingBoxes.optional(),
    arg: Joi.string(),
    value: Joi.alternatives(
      Joi.string(),
      Joi.number(),
      Joi.array().items(Joi.string())
    ).allow(null),
  }).optional(),
  relationships: relationships.optional(),
});
