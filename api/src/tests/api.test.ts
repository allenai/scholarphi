import * as Knex from "knex";
import ApiServer from "../server";
import { DataResponse, Entity, EntityPostPayload } from "../types/api";
import {
  createDefaultQueryBuilder,
  initServer,
  setupTestDatabase,
  teardownTestDatabase,
  truncateTables,
} from "./setup";

describe("API", () => {
  let server: ApiServer;
  let knex: Knex;

  beforeAll(async () => {
    await setupTestDatabase();
    knex = createDefaultQueryBuilder();
  });

  afterAll(async () => {
    await knex.destroy();
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    server = await initServer();
  });

  /*
   * Because the tables are cleared between after each test, each 'test' function must
   * initialize its own data.
   */
  afterEach(async () => {
    truncateTables(knex);
    await server.stop();
    /*
     * Server should be destroyed to clean up the database connection created with each initServer()
     */
    await server.destroy();
  });

  test("GET /health", async () => {
    const response = await server.inject({
      method: "get",
      url: "/health",
    });
    expect(response.statusCode).toEqual(200);
  });

  describe("GET /api/v0/papers/arxiv:{arxivId}/entities", () => {
    test("generic entity", async () => {
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

      const response = await server.inject({
        method: "get",
        url: "/api/v0/papers/arxiv:1111.1111/entities",
      });

      expect(response.statusCode).toEqual(200);
      expect(response.result).toEqual({
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

    test("citation", async () => {
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
      ]);
      await knex.batchInsert("entitydata", [
        {
          id: 1,
          entity_id: 1,
          source: "test",
          type: "scalar",
          key: "paper_id",
          value: "citation_paper_id",
        },
      ] as EntityDataRow[]);

      const response = await server.inject({
        method: "get",
        url: "/api/v0/papers/arxiv:1111.1111/entities",
      });
      expect(response.statusCode).toEqual(200);
      const data = (response.result as any).data;
      expect(data).toContainEqual({
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
    });

    test("symbol", async () => {
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
          id: 2,
          paper_id: "s2id",
          version: 0,
          type: "symbol",
          source: "test",
        },
      ] as EntityRow[]);
      await knex.batchInsert("entitydata", [
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

      const response = await server.inject({
        method: "get",
        url: "/api/v0/papers/arxiv:1111.1111/entities",
      });
      expect(response.statusCode).toEqual(200);
      expect((response.result as any).data).toContainEqual({
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
    });

    test("sentence", async () => {
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
          id: 3,
          paper_id: "s2id",
          version: 0,
          type: "sentence",
          source: "test",
        },
      ] as EntityRow[]);
      await knex.batchInsert("entitydata", [
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
      ] as EntityDataRow[]);
      const response = await server.inject({
        method: "get",
        url: "/api/v0/papers/arxiv:1111.1111/entities",
      });
      expect((response.result as any).data).toContainEqual({
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

  describe("POST /api/v0/papers/arxiv:{arxivId}/entities", () => {
    test("generic entity", async () => {
      await knex("paper").insert({
        s2_id: "s2id",
        arxiv_id: "1111.1111",
      } as PaperRow);
      await knex("version").insert({
        id: 1,
        paper_id: "s2id",
        index: 0,
      } as VersionRow);

      let payload: EntityPostPayload = {
        data: {
          type: "unknown",
          attributes: {
            source: "test",
            version: 0,
            bounding_boxes: [
              {
                source: "test",
                page: 0,
                top: 0,
                left: 0,
                width: 0.1,
                height: 0.05,
              },
            ],
          },
          relationships: {},
        },
      };

      const response = await server.inject({
        method: "post",
        url: "/api/v0/papers/arxiv:1111.1111/entities",
        payload,
      });

      expect(response.statusCode).toEqual(201);
      const data = (response.result as any).data;
      expect(data).toMatchObject(payload.data);
      expect(data.id).not.toBeUndefined();
    });
  });
});
