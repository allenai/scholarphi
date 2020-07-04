import { Server, ServerInjectOptions } from "@hapi/hapi";
import * as nconf from "nconf";
import * as api from "./api";
import { Connection, extractConnectionParams } from "./db-connection";
import { debugFailAction } from "./validation";

/**
 * Wrapper around hapi server that takes care of stateful server start and stop operations.
 */
class ApiServer {
  constructor(config: nconf.Provider, debug?: boolean) {
    this._config = config;
    this._debug = debug || false;
  }

  async init() {
    this._server = new Server({
      port: 3000,
      host: "0.0.0.0",
      debug: {
        request: ["error"],
      },
      routes: {
        validate: {
          failAction: this._debug ? debugFailAction : undefined,
        },
      },
    });

    /**
     * The database connection is initialized in the server object, instead of
     * in the plugin code, because a reference to the connection needs to be saved
     * so that the connection can be closed when the server is shut down.
     */
    const connectionParams = extractConnectionParams(this._config);
    this._dbConnection = new Connection(connectionParams);

    /**
     * Register API endpoints.
     */
    await this._server.register({
      plugin: api.plugin,
      options: { connection: this._dbConnection, debug: this._debug },
      routes: {
        prefix: "/api/v0/",
      },
    });

    this._server.route({ method: "GET", path: "/health", handler: () => "👍" });
  }

  async start() {
    if (this._server === null) {
      console.error(
        "start() called on server before it was initialized. Call init() first."
      );
      return;
    }

    await this._server.start();
    console.log("Server running on %s", this._server.info.uri);

    this._server.events.on("log", (event, tags) => {
      if (tags.error) {
        console.log(`Server error: ${event.error ? event.error : "unknown"}`);
      }
    });
  }

  async stop() {
    if (this._server === null) {
      return;
    }
    await this._server.stop();
  }

  /**
   * Destroy the resources associated with this server (e.g., database connections).
   * Should be called after 'stop' if the server is started.
   */
  async destroy() {
    if (this._dbConnection === null) {
      console.error(
        "destroy() called on server before it was initialized. Call init() first."
      );
      return;
    }
    await this._dbConnection.close();
  }

  /**
   * Exposed only for test purposes. If called in production, should be wrapped with error handler.
   */
  inject(options: string | ServerInjectOptions) {
    if (this._server === null) {
      throw Error(
        "inject() called on server before it was initialized. Call init() first."
      );
    }
    return this._server.inject(options);
  }

  private _debug: boolean;
  private _config: nconf.Provider;
  private _server: Server | null = null;
  private _dbConnection: Connection | null = null;
}

export default ApiServer;
