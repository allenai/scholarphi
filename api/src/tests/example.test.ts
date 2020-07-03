import { Server } from "@hapi/hapi";
import * as Knex from "knex";
import { DataResponse } from "../types/response";
import {
  createDefaultQueryBuilder,
  initServerWithTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
} from "./common";

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  teardownTestDatabase();
});

describe("API", () => {
  let server: Server;
  let knex: Knex;

  beforeAll(async () => {
    knex = createDefaultQueryBuilder();
  });

  afterAll(async () => {
    knex.destroy();
  });

  beforeEach(async () => {
    server = await initServerWithTestDatabase();
  });

  afterEach(async () => {
    await server.stop();
    /**
     * Reset the database between tests.
     */
    for (const table in ["paper", "entity", "entitydata", "boundingbox"]) {
      knex(table).truncate();
    }
  });

  describe("GET /health", () => {
    it("returns a 200", async () => {
      const res = await server.inject({
        method: "get",
        url: "/health",
      });
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("GET /api/v0/papers/arxiv:{arxivId}/entities", () => {
    it("returns a 200", async () => {
      /*
       * Insert single entity for single paper into the table.
       */
      await knex("paper").insert({
        s2_id: "s2id",
        arxiv_id: "1111.1111",
      } as PaperRow);
      await knex("version").insert({
        id: 1,
        paper_id: "s2id",
        index: 0,
      } as VersionRow);
      await knex("entity").insert({
        id: 1,
        paper_id: "s2id",
        version: 0,
        type: "unknown",
        source: "test",
      } as EntityRow);

      const res = await server.inject({
        method: "get",
        url: "/api/v0/papers/arxiv:1111.1111/entities",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.result).toEqual({
        data: [
          {
            id: "1",
            type: "unknown",
            attributes: {
              source: "test",
              version: 0,
              bounding_boxes: [],
            },
            relationships: {},
          },
        ],
      } as DataResponse);
    });
  });
});
