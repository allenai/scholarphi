import * as Hapi from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import * as nconf from "nconf";
import { Connection } from "./queries";

export const init = async (config: nconf.Provider) => {
  const server = new Hapi.Server({
    port: 3000,
    host: "localhost",
    debug: {
      request: ["error"]
    }
  });

  const dbConnection = new Connection(config);

  server.route({
    method: "GET",
    path: "/{s2Id}/citations",
    handler: request => {
      const s2Id = request.params.s2Id;
      return dbConnection.getCitationsForS2Id(s2Id);
    },
    options: {
      validate: {
        params: Joi.object({
          s2Id: Joi.string()
            .alphanum()
            .length(40)
        })
      }
    }
  });

  server.route({
    method: "GET",
    path: "/arxiv:{arxivId}/citations",
    handler: request => {
      const arxivId = request.params.arxivId;
      return dbConnection.getCitationsForArxivId(arxivId);
    },
    options: {
      validate: {
        params: Joi.object({
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
            Joi.string().pattern(/[a-zA-Z0-9-]+\.[A-Z]{2}\/[0-9]{2}[0-9]{2}[0-9]+(v[0-9]+)/)
          )
        })
      }
    }
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);

  server.events.on("log", (event, tags) => {
    if (tags.error) {
      console.log(`Server error: ${event.error ? event.error : "unknown"}`);
    }
  });
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});
