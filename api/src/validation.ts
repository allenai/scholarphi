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

/**
 * This helper can be used with joi's 'alter' method to require fields only
 * for 'POST' requests (when most fields need to be set).
 */
const requireForPost = {
  post: (s: Joi.Schema) => s.required(),
};

const boundingBox = Joi.object({
  page: Joi.number().integer().min(0).required(),
  source: Joi.string().required(),
  left: Joi.number().required(),
  top: Joi.number().required(),
  width: Joi.number().required(),
  height: Joi.number().required(),
});

const boundingBoxes = Joi.array().items(boundingBox);

const attributes = Joi.object({
  version: Joi.number().alter(requireForPost),
  source: Joi.string().alter(requireForPost),
  bounding_boxes: boundingBoxes.alter(requireForPost),
}).alter({
  /*
   * Define custom attributes for specific entity types here.
   */
  citation: (s) =>
    (s as Joi.ObjectSchema)
      .keys({
        paper_id: Joi.string().alter(requireForPost),
      })
      .options({ presence: "required" }),
  symbol: (s) =>
    (s as Joi.ObjectSchema)
      .keys({
        mathml: Joi.string().alter(requireForPost),
        mathml_near_matches: Joi.array()
          .items(Joi.string())
          .alter(requireForPost),
        sentence: Joi.string().allow(null).alter(requireForPost),
      })
      .options({ presence: "required" }),
  sentence: (s) =>
    (s as Joi.ObjectSchema)
      .keys({
        text: Joi.string().alter(requireForPost),
        tex_start: Joi.number().alter(requireForPost),
        tex_end: Joi.number().alter(requireForPost),
      })
      .options({ presence: "required" }),
});

const relationship = (options: { nullable?: boolean; type?: string }) => {
  let typeValidation = Joi.string().required();
  if (options.type) {
    typeValidation = typeValidation.valid(options.type);
  }
  let idValidation = Joi.string().required();
  if (options.nullable) {
    idValidation = idValidation.allow(null);
  }
  return Joi.object({
    type: typeValidation,
    id: idValidation,
  });
};

const relationships = Joi.object().alter({
  /*
   * Define custom relationships for specific entity types here.
   */
  symbol: (s) =>
    (s as Joi.ObjectSchema)
      .keys({
        sentence: relationship({ type: "sentence", nullable: true }),
        children: Joi.array().items(relationship({ type: "symbol" })),
      })
      .options({ presence: "required" }),
});

const entity = Joi.object({
  data: Joi.object({
    id: Joi.string().alter({
      post: (s) => s.forbidden(),
      patch: (s) => s.required(),
    }),
    type: Joi.string()
      .required()
      /*
       * Add a type name for a custom entity here to enable strict attribute validation
       * for that type. The 'type' for this entity will then only be allowed in conjunction
       * with the strict set of expected attributes and relationships defined by the 'alter'
       * rules for that type.
       */
      .disallow("citation", "symbol", "sentence")
      .alter({
        /*
         * Add the type name for each allowed entity type here.
         */
        citation: (s) => s.valid("citation"),
        symbol: (s) => s.valid("symbol"),
        sentence: (s) => s.valid("sentence"),
      }),
    attributes: attributes.alter(requireForPost),
    relationships: relationships.alter(requireForPost),
  }),
});

/*
 * Add all expected types of entities here.
 */
const allEntityTypes = Joi.alternatives(
  entity.tailor("notype"),
  entity.tailor("citation"),
  entity.tailor("symbol"),
  entity.tailor("sentence")
);

export const entityPostPayload = allEntityTypes.tailor("post");
export const entityPatchPayload = allEntityTypes.tailor("patch");
