import * as Hapi from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import * as nconf from "nconf";
import { AnnotationData, Connection } from "./queries";
import * as s2Api from "./s2-api";
import * as validation from "./validation";

interface ApiOptions {
  config: nconf.Provider;
}

export const plugin = {
  name: "API",
  version: "0.0.1",
  register: async function(server: Hapi.Server, options: ApiOptions) {
    const dbConnection = new Connection(options.config);

    server.route({
      method: "GET",
      path: "papers/{s2Id}/citations",
      handler: request => {
        const s2Id = request.params.s2Id;
        return dbConnection.getCitationsForS2Id(s2Id);
      },
      options: {
        validate: {
          params: validation.s2Id
        }
      }
    });

    server.route({
      method: "GET",
      path: "papers/arxiv:{arxivId}/citations",
      handler: request => {
        const arxivId = request.params.arxivId;
        return dbConnection.getCitationsForArxivId(arxivId);
      },
      options: {
        validate: {
          params: validation.arxivId
        }
      }
    });

    server.route({
      method: "GET",
      path: "papers/arxiv:{arxivId}/symbols",
      handler: request => {
        const arxivId = request.params.arxivId;
        return dbConnection.getSymbolsForArxivId(arxivId);
      },
      options: {
        validate: {
          params: validation.arxivId
        }
      }
    });

    server.route({
      method: "GET",
      path: "papers/arxiv:{arxivId}/mathml",
      handler: request => {
        const arxivId = request.params.arxivId;
        return dbConnection.getMathMlForArxivId(arxivId);
      },
      options: {
        validate: {
          params: validation.arxivId
        }
      }
    });

    server.route({
      method: "GET",
      path: "papers/arxiv:{arxivId}/sentences",
      handler: request => {
        const arxivId = request.params.arxivId;
        return dbConnection.getSentencesForArxivId(arxivId);
      },
      options: {
        validate: {
          params: validation.arxivId
        }
      }
    });

    server.route({
      method: "GET",
      path: "papers",
      handler: request => {
        let idString;
        if (typeof request.query.id === "string") {
          idString = request.query.id;
        } else {
          idString = request.query.id.join(",");
        }
        const ids = idString.split(",");
        const uniqueIds = ids.filter((id, index) => {
          return ids.indexOf(id) === index;
        });
        return s2Api.getPapers(uniqueIds);
      },
      options: {
        validate: {
          query: Joi.object({
            /*
             * Papers can be filtered using a comma-separated list of IDs. For now, ID filter is
             * required, as pagination over all resources hasn't been implemented.
             */
            id: Joi.string()
              .pattern(/^$|[a-f0-9]{40}(,[a-f0-9]{40}){0,199}/)
              .required()
          })
        }
      }
    });

    server.route({
      method: "GET",
      path: "papers/arxiv:{arxivId}/annotations",
      handler: request => {
        const arxivId = request.params.arxivId;
        return dbConnection.getAnnotationsForArxivId(arxivId);
      },
      options: {
        validate: {
          params: validation.arxivId
        }
      }
    });

    /**
     * Example usage:
     * requests.post(
     *   "http://localhost:3000/api/v0/papers/arxiv:1508.07252/annotations",
     *   json={
     *     "type": "symbol",
     *     "page": 0,
     *     "left": 10,
     *     "top": 20,
     *     "width": 100,
     *     "height": 20
     *   }
     * )
     */
    server.route({
      method: "POST",
      path: "papers/arxiv:{arxivId}/annotations",
      handler: async (request, h) => {
        const arxivId = request.params.arxivId;
        const id = await dbConnection.postAnnotationForArxivId(
          arxivId,
          request.payload as AnnotationData
        );
        return h.response(id).code(201);
      },
      options: {
        validate: {
          params: validation.arxivId,
          payload: validation.annotation
        }
      }
    });

    /**
     * Example usage:
     * requests.put(
     *   "http://localhost:3000/api/v0/papers/arxiv:1508.07252/annotation/2",
     *   json={
     *     "type": "symbol",
     *     "page": 0,
     *     "left": 10,
     *     "top": 20,
     *     "width": 100,
     *     "height": 20
     *   }
     * )
     */
    server.route({
      method: "PUT",
      path: "papers/arxiv:{arxivId}/annotation/{id}",
      handler: async (request, h) => {
        const { arxivId, id } = request.params;
        const annotation = await dbConnection.putAnnotation(
          arxivId,
          Number(id),
          request.payload as AnnotationData
        );
        return h.response(annotation).code(200);
      },
      options: {
        validate: {
          params: validation.arxivId.append({
            id: Joi.number()
              .integer()
              .required()
          }),
          payload: validation.annotation
        }
      }
    });

    /**
     * Example usage:
     * requests.delete(
     *   "http://localhost:3000/api/v0/papers/arxiv:1508.07252/annotation/2
     * ")
     */
    server.route({
      method: "DELETE",
      path: "papers/arxiv:{arxivId}/annotation/{id}",
      handler: async (request, h) => {
        const { arxivId, id } = request.params;
        await dbConnection.deleteAnnotation(arxivId, Number(id));
        return h.response().code(204);
      },
      options: {
        validate: {
          params: validation.arxivId.append({
            id: Joi.number()
              .integer()
              .required()
          })
        }
      }
    });

    server.route({
      method: "GET",
      path: "papers/list",
      handler: async (request, h) => {
        const papers = await dbConnection.getAllPapers();
        return papers;
      }
    });
  }
};
