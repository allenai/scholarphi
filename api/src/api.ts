import * as Hapi from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import * as nconf from "nconf";
import { Connection, extractConnectionParams } from "./db-connection";
import * as s2Api from "./s2-api";
import { EntityPatchData, EntityPostData } from "./types/response";
import * as validation from "./validation";

interface ApiOptions {
  config: nconf.Provider;
}

export const plugin = {
  name: "API",
  version: "0.0.2",
  register: async function (server: Hapi.Server, options: ApiOptions) {
    const connectionParams = extractConnectionParams(options.config);
    const dbConnection = new Connection(connectionParams);

    server.route({
      method: "GET",
      path: "papers/{s2Id}/entities",
      handler: (request) => {
        const s2Id = request.params.s2Id;
        return dbConnection.getEntitiesForPaper({ s2_id: s2Id });
      },
      options: {
        validate: {
          params: validation.s2Id,
        },
      },
    });

    server.route({
      method: "GET",
      path: "papers/arxiv:{arxivId}/entities",
      handler: (request) => {
        const arxivId = request.params.arxivId;
        return dbConnection.getEntitiesForPaper({ arxiv_id: arxivId });
      },
      options: {
        validate: {
          params: validation.arxivId,
        },
      },
    });

    server.route({
      method: "GET",
      path: "papers",
      handler: (request) => {
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
              .required(),
          }),
        },
      },
    });

    /**
     * TODO(andrewhead): update these usages.
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
      path: "papers/arxiv:{arxivId}/entities",
      handler: async (request, h) => {
        const arxivId = request.params.arxivId;
        const entity = await dbConnection.postEntity(
          { arxiv_id: arxivId },
          request.payload as EntityPostData
        );
        if (entity === null) {
          return h.response().code(500);
        }
        return h.response(entity).code(201);
      },
      options: {
        validate: {
          params: validation.arxivId,
          payload: validation.entityPostData,
        },
      },
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
      method: "PATCH",
      path: "papers/arxiv:{arxivId}/annotation/{id}",
      handler: async (request, h) => {
        const entity = await dbConnection.patchAnnotation(
          request.payload as EntityPatchData
        );
        return h.response({}).code(200);
      },
      options: {
        validate: {
          params: validation.arxivId.append({
            id: Joi.string().required(),
          }),
          payload: validation.entityPatchData,
        },
      },
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
        const { id } = request.params;
        await dbConnection.deleteEntity(id);
        return h.response().code(204);
      },
      options: {
        validate: {
          params: validation.arxivId.append({
            id: Joi.string().required(),
          }),
        },
      },
    });

    server.route({
      method: "GET",
      path: "papers/list",
      handler: async () => {
        const papers = await dbConnection.getAllPapers();
        return papers;
      },
    });
  },
};
