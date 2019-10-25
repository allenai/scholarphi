import * as Hapi from "@hapi/hapi";
import * as Joi from "@hapi/joi";
import * as knex_init from "knex";
import * as nconf from "nconf";

export const init = async (config: nconf.Provider) => {
  const server = new Hapi.Server({
    port: 3000,
    host: "localhost",
    debug: {
      request: ["error"]
    }
  });

  const knex = knex_init({
    client: "pg",
    connection: {
      host: config.get("database:host"),
      port: config.get("database:port"),
      user: config.get("database:user"),
      password: config.get("database:password"),
      database: config.get("database:database")
    }
  });

  server.route({
    method: "GET",
    path: "/{s2id}/citations",
    handler: request => {
      const s2id = request.params.s2id;
      return knex("citation")
        .select()
        .first();
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
