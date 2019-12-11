import * as Joi from "@hapi/joi";

export const s2Id = Joi.object({
  s2Id: Joi.string().pattern(/[a-f0-9]{40}/)
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
  )
});

/**
 * Validation for 'Annotation' type.
 */
export const annotation = Joi.object({
  type: Joi.string()
    .allow("citation", "symbol")
    .required(),
  boundingBox: Joi.object({
    page: Joi.number()
      .integer()
      .min(0)
      .required(),
    left: Joi.number().required(),
    top: Joi.number().required(),
    width: Joi.number().required(),
    height: Joi.number().required()
  }).required()
});
