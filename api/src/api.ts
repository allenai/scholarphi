import * as Hapi from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import { Connection } from "./db-connection";
import * as s2Api from "./s2-api";
import { EntityPatchPayload, EntityPostPayload } from "./types/api";
import * as validation from "./validation";

interface ApiOptions {
  connection: Connection;
}

/**
 * For example usages of each route, see the unit tests.
 */
export const plugin = {
  name: "API",
  version: "0.0.2",
  register: async function (server: Hapi.Server, options: ApiOptions) {
    const { connection: dbConnection } = options;

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
      handler: async (request) => {
        const arxivId = request.params.arxivId;
        let res;
        try {
          res = await dbConnection.getEntitiesForPaper({ arxiv_id: arxivId });
        } catch (e) {
          console.log(e);
        }
        return { data: res };
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

    server.route({
      method: "POST",
      path: "papers/arxiv:{arxivId}/entities",
      handler: async (request, h) => {
        const arxivId = request.params.arxivId;
        const entity = await dbConnection.createEntity(
          { arxiv_id: arxivId },
          (request.payload as EntityPostPayload).data
        );
        return h.response({ data: entity }).code(201);
      },
      options: {
        validate: {
          params: validation.arxivId,
          payload: validation.entityPost,
        },
      },
    });

    server.route({
      method: "PATCH",
      path: "papers/arxiv:{arxivId}/entities/{id}",
      handler: async (request, h) => {
        await dbConnection.updateEntity(
          (request.payload as EntityPatchPayload).data
        );
        return h.response({}).code(204);
      },
      options: {
        validate: {
          params: validation.arxivId.append({
            id: Joi.string().required(),
          }),
          payload: validation.entityPatch,
        },
      },
    });

    server.route({
      method: "DELETE",
      path: "papers/arxiv:{arxivId}/entities/{id}",
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
