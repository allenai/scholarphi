import { Server } from "@hapi/hapi";
import * as nconf from "nconf";

nconf
  .argv()
  .env()
  .file({ file: process.env.SECRETS_FILE || "config/secret.json" })
  .defaults({
    database: {
      host: "scholar-reader.c5tvjmptvzlz.us-west-2.rds.amazonaws.com",
      port: 5432,
      database: "scholar-reader",
      user: "api",
      schema: "public"
    }
  });

export const init = async (config: nconf.Provider) => {
  const server = new Server({
    port: 3000,
    host: "0.0.0.0",
    debug: {
      request: ["error"]
    }
  });

  await server.register({
    plugin: require("./api"),
    options: { config },
    routes: {
      prefix: "/api/v0/"
    }
  });

  server.route({ method: "GET", path: "/health", handler: () => "👍" });

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

init(nconf);
