import * as Hapi from "@hapi/hapi";
import * as HapiAuthBearer from 'hapi-auth-bearer-token';
import * as Joi from "@hapi/joi";
import { Connection, PaperSelector } from "./db-connection";
import * as s2Api from "./s2-api";
import {
  EntityCreatePayload,
  EntityUpdatePayload,
  Paper,
  PaperWithIdInfo,
  Paginated,
  EntityType
} from "./types/api";
import * as validation from "./types/validation";
import * as conf from "./conf";

interface ApiOptions {
  connection: Connection;
  config: conf.Config;
}

function firstQueryStringValue(request: Hapi.Request, name: string): string | undefined {
  const v = request.query[name];
  return Array.isArray(v) ? v.shift() : v;
}

function firstIntOrDefault(request: Hapi.Request, name: string, defaultValue: number): number {
  const v = parseInt(firstQueryStringValue(request, name) || "");
  if (isNaN(v)) {
    return defaultValue;
  }
  return v;
}

// Intended for use after validating the parameter.
function parsePaperSelector(rawSelector: string): PaperSelector {
  return rawSelector.startsWith("arxiv:") ? {
    arxiv_id: rawSelector.replace("arxiv:", ""),
  } : {
    s2_id: rawSelector,
  };
}

/**
 * For example usages of each route, see the unit tests.
 */
export const plugin = {
  name: "API",
  version: "0.0.2",
  register: async function (server: Hapi.Server, options: ApiOptions) {
    const { connection: dbConnection, config } = options;

    await server.register(HapiAuthBearer);
    server.auth.strategy('admin-token', 'bearer-access-token', {
      allowQueryToken: true,
      validate: async (request, token, h) => {
        const credentials = { token };
        const artifacts = { };

        // if no token has been set, fail all requests
        if(!token) {
          return { isValid: false, credentials, artifacts};
        }

        const isValid = token === config.adminToken;
        return { isValid, credentials, artifacts };
      }
  });


    server.route({
      method: "GET",
      path: "papers/list",
      handler: async (request) => {
        const offset = firstIntOrDefault(request, "offset", 0);
        const size = firstIntOrDefault(request, "size", 25);

        const papers = await dbConnection.getAllPapers(offset, size);
        const paperIds = papers.rows.map(p => p.s2_id);

        // We fetch metadata about each paper (it's title, author names, etc) from S2's public
        // API and merged them into the result set.
        const s2PaperInfoByPaperId: { [pid: string]: Paper } = {};
        for (const s2Paper of await s2Api.getPapers(paperIds, config.s2.apiKey, false)) {
          if (!s2Paper) {
            continue;
          }
          if (s2Paper.s2Id in s2PaperInfoByPaperId) {
            console.warn(`Duplicate paper id: ${s2Paper.s2Id}`);
            continue;
          }
          s2PaperInfoByPaperId[s2Paper.s2Id] = s2Paper;
        }
        const mergedPapers: PaperWithIdInfo[] = [];
        for (const paper of papers.rows) {
          const maybeS2Paper = s2PaperInfoByPaperId[paper.s2_id];
          mergedPapers.push({
            ...paper,
            abstract: maybeS2Paper?.abstract,
            authors: maybeS2Paper?.authors,
            title: maybeS2Paper?.title,
            url: maybeS2Paper?.url,
            venue: maybeS2Paper?.venue,
            year: maybeS2Paper?.year,
            influentialCitationCount: maybeS2Paper?.influentialCitationCount,
            citationVelocity: maybeS2Paper?.citationVelocity
          });
        }
        const response: Paginated<PaperWithIdInfo> = { ...papers, ...{ rows: mergedPapers } };
        return response;
      },
    });

    server.route({
      method: "GET",
      path: "papers",
      handler: async (request) => {
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
        const data = (await s2Api.getPapers(uniqueIds, config.s2.apiKey))
          .filter((paper) => paper !== undefined)
          .map((paper) => paper as Paper)
          .map((paper) => ({
            id: paper.s2Id,
            type: "paper",
            attributes: paper,
          }));
        return { data };
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
      method: "GET",
      path: "papers/{paperSelector}",
      handler: async (request, h) => {
        const paperSelector = parsePaperSelector(request.params.paperSelector);
        const exists = await dbConnection.checkPaper(paperSelector);
        return exists ? h.response().code(204) : h.response().code(404);
      },
      options: {
        validate: {
          params: validation.paperSelector,
        },
      },
    });

    server.route({
      method: "GET",
      path: "papers/{paperSelector}/entities",
      handler: async (request) => {
        const paperSelector = parsePaperSelector(request.params.paperSelector);
        // Runtime type-checked during validation.
        const entityTypes = request.query.type as EntityType[];
        let res;
        try {
          res = await dbConnection.getEntitiesForPaper(paperSelector, entityTypes);
        } catch (e) {
          console.log(e);
        }
        return { data: res };
      },
      options: {
        validate: {
          params: validation.paperSelector,
          query: Joi.object({
            type:  validation.apiEntityTypes
          })
        },
      },
    });

    server.route({
      method: "POST",
      path: "papers/{arxivSelector}/entities",
      handler: async (request, h) => {
        const paperSelector = parsePaperSelector(request.params.arxivSelector);
        const entity = await dbConnection.createEntity(
          paperSelector,
          (request.payload as EntityCreatePayload).data
        );
        return h.response({ data: entity }).code(201);
      },
      options: {
        validate: {
          params: validation.arxivOnlySelector,
          payload: validation.entityPost,
        },
      },
    });

    server.route({
      method: "PATCH",
      path: "papers/{arxivSelector}/entities/{id}",
      handler: async (request, h) => {
        await dbConnection.updateEntity(
          (request.payload as EntityUpdatePayload).data
        );
        return h.response({}).code(204);
      },
      options: {
        auth: 'admin-token',
        validate: {
          params: validation.arxivOnlySelector.append({
            id: Joi.string().required(),
          }),
          payload: validation.entityPatch,
        },
      },
    });

    server.route({
      method: "DELETE",
      path: "papers/{arxivSelector}/entities/{id}",
      handler: async (request, h) => {
        const { id } = request.params;
        await dbConnection.deleteEntity(id);
        return h.response().code(204);
      },
      options: {
        auth: 'admin-token',
        validate: {
          params: validation.arxivOnlySelector.append({
            id: Joi.string().required(),
          }),
        },
      },
    });

    server.route({
      method: "GET",
      path: "papers/{arxivSelector}/version",
      handler: async (request, h) => {
        const paperSelector = parsePaperSelector(request.params.arxivSelector);
        const version = await dbConnection.getLatestProcessedArxivVersion(paperSelector);
        const citationCount = version !== null ? await dbConnection.getPaperEntityCount(paperSelector, 'citation'): null;
        if (version === null || citationCount === null) {
          // We don't have version info for this ID, or no citations were extracted so we consider
          // it unsuccessfully processed.
          return h.response().code(404);
        }
        return h.response({ version }).code(200);
      },
      options: {
        validate: {
          params: validation.arxivOnlySelector,
        },
      },
    });
  },
};
