import * as Knex from "knex";
import ApiServer from "../server";
import { DataResponse, Entity } from "../types/response";
import {
  createDefaultQueryBuilder,
  initServer,
  setupTestDatabase,
  teardownTestDatabase,
} from "./common";

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe("API", () => {
  let server: ApiServer;
  let knex: Knex;

  beforeAll(async () => {
    knex = createDefaultQueryBuilder();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  beforeEach(async () => {
    server = await initServer();
    /**
     * Reset the database between tests. Tables are listed in the order they should be
     * truncated to make sure that foreign key references are deleted before the data that
     * they refer to.
     */
    for (const table of [
      "paper",
      "version",
      "entity",
      "boundingbox",
      "entitydata",
    ]) {
      await knex.raw(`TRUNCATE TABLE ${table} CASCADE`);
    }
  });

  afterEach(async () => {
    await server.stop();
    /*
     * Destory server to ensure that the database connections created by the server have been
     * cleaned up, to avoid those pesky "tests did not exit" warnings.
     */
    await server.destroy();
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
       * Insert single entity for single paper into the table with one bounding box.
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
      await knex("boundingbox").insert({
        id: 1,
        entity_id: 1,
        source: "test",
        page: 0,
        left: 0,
        top: 0,
        width: 0.1,
        height: 0.05,
      } as BoundingBoxRow);

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
              bounding_boxes: [
                {
                  source: "test",
                  page: 0,
                  left: 0,
                  top: 0,
                  width: 0.1,
                  height: 0.05,
                },
              ],
            },
            relationships: {},
          },
        ],
      } as DataResponse);
    });

    it("fills out attributes and relationships for symbols, citations, and sentences", async () => {
      await knex("paper").insert({
        s2_id: "s2id",
        arxiv_id: "1111.1111",
      } as PaperRow);
      await knex("version").insert({
        id: 1,
        paper_id: "s2id",
        index: 0,
      } as VersionRow);
      await knex.batchInsert("entity", [
        {
          id: 1,
          paper_id: "s2id",
          version: 0,
          type: "citation",
          source: "test",
        },
        {
          id: 2,
          paper_id: "s2id",
          version: 0,
          type: "symbol",
          source: "test",
        },
        {
          id: 3,
          paper_id: "s2id",
          version: 0,
          type: "sentence",
          source: "test",
        },
      ] as EntityRow[]);
      /*
       * These properties should be extracted and loaded into known fields of each type of entity.
       */
      await knex.batchInsert("entitydata", [
        {
          id: 1,
          entity_id: 1,
          source: "test",
          type: "scalar",
          key: "paper_id",
          value: "citation_paper_id",
        },
        {
          id: 2,
          entity_id: 2,
          source: "test",
          type: "scalar",
          key: "mathml",
          value: "<math></math>",
        },
        {
          id: 3,
          entity_id: 2,
          source: "test",
          type: "scalar-list",
          key: "mathml_near_matches",
          value: "<math><mi>x</mi></math>",
        },
        {
          id: 4,
          entity_id: 2,
          source: "test",
          type: "scalar-list",
          key: "mathml_near_matches",
          value: "<math><mi>y</mi></math>",
        },
        {
          id: 5,
          entity_id: 2,
          source: "test",
          type: "reference",
          key: "sentence",
          value: "3",
        },
        {
          id: 6,
          entity_id: 2,
          source: "test",
          type: "reference-list",
          key: "children",
          value: "4",
        },
        {
          id: 7,
          entity_id: 2,
          source: "test",
          type: "reference-list",
          key: "children",
          value: "5",
        },
        {
          id: 8,
          entity_id: 3,
          source: "test",
          type: "scalar",
          key: "text",
          value: "Sentence.",
        },
        {
          id: 9,
          entity_id: 3,
          source: "test",
          type: "scalar",
          key: "text",
          value: "Sentence.",
        },
        {
          id: 10,
          entity_id: 3,
          source: "test",
          type: "scalar",
          key: "tex_start",
          value: "0",
        },
        {
          id: 11,
          entity_id: 3,
          source: "test",
          type: "scalar",
          key: "tex_end",
          value: "10",
        },
        /*
         * Here are a few data fields that should *not* show up on the returned object, as they
         * are not known data fields for the entity.
         */
        {
          id: 12,
          entity_id: 2,
          source: "test",
          type: "scalar",
          key: "unknown_property_1",
          value: "1",
        },
        {
          id: 13,
          entity_id: 2,
          source: "test",
          type: "scalar-list",
          key: "unknown_property_2",
          value: "1",
        },
        {
          id: 14,
          entity_id: 2,
          source: "test",
          type: "reference",
          key: "unknown_property_3",
          value: "1",
        },
        {
          id: 15,
          entity_id: 2,
          source: "test",
          type: "reference-list",
          key: "unknown_property_4",
          value: "1",
        },
      ] as EntityDataRow[]);

      const res = await server.inject({
        method: "get",
        url: "/api/v0/papers/arxiv:1111.1111/entities",
      });
      expect(res.statusCode).toEqual(200);
      const result = res.result as any;
      expect(result.data.length).toBe(3);
      expect(result.data).toContainEqual({
        id: "1",
        type: "citation",
        attributes: {
          source: "test",
          version: 0,
          bounding_boxes: [],
          paper_id: "citation_paper_id",
        },
        relationships: {},
      } as Entity);
      expect(result.data).toContainEqual({
        id: "2",
        type: "symbol",
        attributes: {
          source: "test",
          version: 0,
          bounding_boxes: [],
          mathml: "<math></math>",
          mathml_near_matches: [
            "<math><mi>x</mi></math>",
            "<math><mi>y</mi></math>",
          ],
        },
        relationships: {
          sentence: { type: "sentence", id: "3" },
          children: [
            { type: "symbol", id: "4" },
            { type: "symbol", id: "5" },
          ],
        },
      } as Entity);
      expect(result.data).toContainEqual({
        id: "3",
        type: "sentence",
        attributes: {
          source: "test",
          version: 0,
          bounding_boxes: [],
          text: "Sentence.",
          tex_start: 0,
          tex_end: 10,
        },
        relationships: {},
      } as Entity);
    });
  });
});
