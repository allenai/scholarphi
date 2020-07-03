import { Server } from "@hapi/hapi";
import * as nconf from "nconf";

export const init = async (config: nconf.Provider) => {
  const server = new Server({
    port: 3000,
    host: "0.0.0.0",
    debug: {
      request: ["error"],
    },
  });

  await server.register({
    plugin: require("./api"),
    options: { config },
    routes: {
      prefix: "/api/v0/",
    },
  });

  server.route({ method: "GET", path: "/health", handler: () => "👍" });
  return server;
};

export const start = async (server: Server) => {
  await server.start();
  console.log("Server running on %s", server.info.uri);

  server.events.on("log", (event, tags) => {
    if (tags.error) {
      console.log(`Server error: ${event.error ? event.error : "unknown"}`);
    }
  });
};
