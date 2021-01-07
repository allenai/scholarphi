import { Server, ServerInjectOptions } from "@hapi/hapi";
import * as nconf from "nconf";
import * as api from "./api";
import { Connection } from "./db-connection";
import { LogEntryCreatePayload } from "./types/api";
import * as validation from "./types/validation";
import { debugFailAction } from "./types/validation";
import * as conf from "./conf";

/**
 * Wrapper around hapi server that takes care of stateful server start and stop operations.
 */
class ApiServer {
  private _debug: boolean;
  private _config: conf.Config;
  private _server: Server | null = null;
  private _dbConnection: Connection | null = null;

  constructor(config: conf.Config, debug?: boolean) {
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
        cors: {
          origin: ['*.semanticscholar.org', '*.allenai.org', '*.allenai.org:8080'],
        },
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
    const dbConnection = new Connection(this._config.db);
    this._dbConnection = dbConnection;
    console.log(`Using database at ${this._config.db.host}`);

    /**
     * Register API endpoints.
     */
    await this._server.register({
      plugin: api.plugin,
      options: {
        connection: dbConnection,
        debug: this._debug,
        config: this._config
      },
      routes: {
        prefix: "/api/v0/",
      },
    });

    this._server.route({ method: "GET", path: "/api/health", handler: () => "👍" });

    this._server.route({
      method: "POST",
      path: "/api/log",
      handler: async (request, h) => {
        const ipAddress =
          request.headers["x-real-ip"] || request.info.remoteAddress;
        const payload = request.payload as LogEntryCreatePayload;
        try {
          await dbConnection.insertLogEntry({
            ip_address: ipAddress,
            username: payload.username,
            level: payload.level,
            event_type: payload.event_type,
            data: payload.data,
          });
          return h.response().code(200);
        } catch (e) {
          return h.response().code(500);
        }
      },
      options: {
        validate: {
          payload: validation.logEntry,
        },
      },
    });
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


}

export default ApiServer;
