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
    path: "/{s2id}/citations",
    handler: request => {
      const s2id = request.params.s2id;
      return dbConnection.getCitations(s2id);
    },
    options: {
      validate: {
        params: Joi.object({
          s2id: Joi.string()
            .alphanum()
            .length(40)
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
