import * as Knex from "knex";
import ApiServer from "../server";
import {
  Citation,
  Entity,
  EntityCreatePayload,
  EntityGetResponse,
  EntityUpdatePayload,
} from "../types/api";
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
    await truncateTables(knex);
    await server.stop();
    /*
     * Server should be destroyed to clean up the database connection created with each initServer()
     */
    await server.destroy();
  });

  test("GET /api/health", async () => {
    const response = await server.inject({
      method: "get",
      url: "/api/health",
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
      } as EntityGetResponse);
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
          entity_id: 1,
          source: "test",
          key: "paper_id",
          value: "citation_paper_id",
          item_type: "string",
          of_list: false,
          relation_type: null,
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

    // Skipped by @codeviking on 12/10/2020.
    test.skip("symbol", async () => {
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
          entity_id: 2,
          source: "test",
          key: "mathml",
          value: "<math></math>",
          item_type: "string",
          of_list: false,
          relation_type: null,
        },
        {
          entity_id: 2,
          source: "test",
          key: "mathml_near_matches",
          value: "<math><mi>x</mi></math>",
          item_type: "string",
          of_list: true,
          relation_type: null,
        },
        {
          entity_id: 2,
          source: "test",
          key: "mathml_near_matches",
          value: "<math><mi>y</mi></math>",
          item_type: "string",
          of_list: true,
          relation_type: null,
        },
        {
          entity_id: 2,
          source: "test",
          key: "sentence",
          value: "3",
          item_type: "relation-id",
          of_list: false,
          relation_type: "sentence",
        },
        {
          entity_id: 2,
          source: "test",
          key: "children",
          value: "4",
          item_type: "relation-id",
          of_list: true,
          relation_type: "symbol",
        },
        {
          entity_id: 2,
          source: "test",
          key: "children",
          value: "5",
          item_type: "relation-id",
          of_list: true,
          relation_type: "symbol",
        },
        /*
         * Here are a few data fields that should *not* show up on the returned object, as they
         * are not known data fields for the entity.
         */
        {
          entity_id: 2,
          source: "test",
          key: "unknown_property_1",
          value: "1",
          item_type: "integer",
          of_list: false,
          relation_type: null,
        },
        {
          entity_id: 2,
          source: "test",
          key: "unknown_property_3",
          value: "1",
          item_type: "relation-id",
          of_list: true,
          relation_type: "unknown_entity",
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
          tex: null,
          extracted_nickname: null,
          hand_written_nickname: null,
          extracted_definition: null,
          defining_formula: null,
          passages: [],
        },
        relationships: {
          sentence: { type: "sentence", id: "3" },
          parent: { type: "symbol", id: null },
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
          entity_id: 3,
          source: "test",
          key: "text",
          value: "Sentence <symbol>.",
          item_type: "string",
          of_list: false,
          relation_type: null,
        },
        {
          entity_id: 3,
          source: "test",
          key: "tex",
          value: "Sentence $x$.",
          item_type: "string",
          of_list: false,
          relation_type: null,
        },
        {
          entity_id: 3,
          source: "test",
          key: "tex_start",
          value: "0",
          item_type: "integer",
          of_list: false,
          relation_type: null,
        },
        {
          entity_id: 3,
          source: "test",
          key: "tex_end",
          value: "10",
          item_type: "integer",
          of_list: false,
          relation_type: null,
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
          text: "Sentence <symbol>.",
          tex: "Sentence $x$.",
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

      const payload: EntityCreatePayload = {
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

      const entityRows: EntityRow[] = await knex("entity").select();
      expect(entityRows).toHaveLength(1);
      expect(entityRows[0]).toMatchObject({
        paper_id: "s2id",
        type: "unknown",
        source: "test",
        version: 0,
      } as EntityRow);
      const entityId = entityRows[0].id;
      expect(entityId).not.toBeUndefined();

      const boundingBoxRows: BoundingBoxRow[] = await knex(
        "boundingbox"
      ).select();
      expect(boundingBoxRows).toHaveLength(1);
      expect(boundingBoxRows[0]).toMatchObject({
        entity_id: entityId,
        source: "test",
        page: 0,
        left: 0,
        top: 0,
        width: 0.1,
        height: 0.05,
      } as BoundingBoxRow);
      expect(boundingBoxRows[0].id).not.toBeUndefined();

      const entityDataRows: EntityDataRow[] = await knex("entitydata").select();
      expect(entityDataRows).toHaveLength(0);
    });

    test("generic entity with unexpected properties", async () => {
      await knex("paper").insert({
        s2_id: "s2id",
        arxiv_id: "1111.1111",
      } as PaperRow);
      await knex("version").insert({
        id: 1,
        paper_id: "s2id",
        index: 0,
      } as VersionRow);

      const payload: EntityCreatePayload = {
        data: {
          type: "unknown",
          attributes: {
            UNEXPECTED_ATTRIBUTE: "unexpected",
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
          relationships: {
            UNEXPECTED_RELATIONSHIP: { id: "1", type: "unknown" },
          },
        },
      };

      const response = await server.inject({
        method: "post",
        url: "/api/v0/papers/arxiv:1111.1111/entities",
        payload,
      });

      expect(response.statusCode).toEqual(400);
      expect(await knex("entity").select()).toHaveLength(0);
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

      const citation: Omit<Citation, "id"> = {
        type: "citation",
        attributes: {
          source: "test",
          version: 0,
          paper_id: "citation_paper_id",
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
      };

      const payload: EntityCreatePayload = {
        data: citation,
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

      const entityDataRows: EntityDataRow[] = await knex("entitydata").select();
      expect(entityDataRows).toHaveLength(1);
      expect(entityDataRows[0]).toMatchObject({
        source: "test",
        key: "paper_id",
        value: "citation_paper_id",
        item_type: "string",
        of_list: false,
        relation_type: null,
      } as EntityDataRow);
    });

    test("fail on missing entity data", async () => {
      await knex("paper").insert({
        s2_id: "s2id",
        arxiv_id: "1111.1111",
      } as PaperRow);
      await knex("version").insert({
        id: 1,
        paper_id: "s2id",
        index: 0,
      } as VersionRow);

      /*
       * Same as last test, just missing 'paper_id' attribute.
       */
      const citation = {
        type: "citation",
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
      };

      const payload: EntityCreatePayload = {
        data: citation,
      };

      const response = await server.inject({
        method: "post",
        url: "/api/v0/papers/arxiv:1111.1111/entities",
        payload,
      });

      expect(response.statusCode).toEqual(400);
      expect(await knex("entity").select()).toHaveLength(0);
    });
  });

  describe("PATCH /api/v0/papers/arxiv:{arxivId}/entities/{entityId}", () => {
    test("generic entity attributes", async () => {
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
          type: "unknown",
          source: "test",
        },
      ] as EntityRow[]);

      const payload: EntityUpdatePayload = {
        data: {
          id: "1",
          type: "unknown",
          attributes: {
            source: "patch-source",
          },
        },
      };

      const response = await server.inject({
        method: "patch",
        url: "/api/v0/papers/arxiv:1111.1111/entities/1",
        payload,
      });

      expect(response.statusCode).toEqual(204);
      expect(response.result).toBeNull();
      expect(response.payload).toEqual("");

      const entityRows: EntityRow[] = await knex("entity").select();
      expect(entityRows).toHaveLength(1);
      expect(entityRows[0]).toMatchObject({
        source: "patch-source",
      } as EntityRow);
    });

    test("generic entity bounding boxes", async () => {
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
          type: "unknown",
          source: "test",
        },
      ] as EntityRow[]);
      await knex.batchInsert("boundingbox", [
        {
          entity_id: 1,
          source: "test",
          page: 0,
          left: 0,
          top: 0,
          width: 0.1,
          height: 0.05,
        },
      ] as BoundingBoxRow[]);

      const payload: EntityUpdatePayload = {
        data: {
          id: "1",
          type: "unknown",
          attributes: {
            source: "patch-source",
            bounding_boxes: [
              {
                source: "test",
                page: 1,
                top: 10,
                left: 10,
                width: 0.2,
                height: 0.1,
              },
            ],
          },
        },
      };

      const response = await server.inject({
        method: "patch",
        url: "/api/v0/papers/arxiv:1111.1111/entities/1",
        payload,
      });

      expect(response.statusCode).toEqual(204);

      const boundingBoxRows: BoundingBoxRow[] = await knex(
        "boundingbox"
      ).select();
      expect(boundingBoxRows).toHaveLength(1);
      expect(boundingBoxRows[0]).toMatchObject({
        entity_id: 1,
        source: "test",
        page: 1,
        top: 10,
        left: 10,
        width: 0.2,
        height: 0.1,
      } as BoundingBoxRow);
      expect(boundingBoxRows[0].id).not.toBeUndefined();
    });

    test("entity-specific attributes", async () => {
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
          type: "symbol",
          source: "test",
        },
      ] as EntityRow[]);
      await knex.batchInsert("entitydata", [
        {
          entity_id: 1,
          source: "test",
          key: "mathml",
          value: "<math></math>",
          item_type: "string",
          of_list: false,
          relation_type: null,
        },
        {
          entity_id: 1,
          source: "test",
          key: "mathml_near_matches",
          value: "<math><mi>x</mi></math>",
          item_type: "string",
          of_list: true,
          relation_type: null,
        },
        {
          entity_id: 1,
          source: "test",
          key: "mathml_near_matches",
          value: "<math><mi>y</mi></math>",
          item_type: "string",
          of_list: true,
          relation_type: null,
        },
      ]);

      const payload: EntityUpdatePayload = {
        data: {
          id: "1",
          type: "symbol",
          attributes: {
            source: "patch-source",
            mathml: "<math><mi>z</mi></math>",
          },
        },
      };

      const response = await server.inject({
        method: "patch",
        url: "/api/v0/papers/arxiv:1111.1111/entities/1",
        payload,
      });

      expect(response.statusCode).toEqual(204);

      const entityDataRows: EntityDataRow[] = await knex("entitydata").select();
      expect(entityDataRows).toHaveLength(3);

      const mathMlRows: EntityDataRow[] = await knex("entitydata")
        .select()
        .where({ key: "mathml" });
      expect(mathMlRows).toHaveLength(1);
      expect(mathMlRows[0]).toMatchObject({
        value: "<math><mi>z</mi></math>",
        source: "patch-source",
      });
    });

    test("relationships", async () => {
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
          type: "symbol",
          source: "test",
        },
      ] as EntityRow[]);
      await knex.batchInsert("entitydata", [
        {
          entity_id: 1,
          source: "test",
          key: "sentence",
          value: "3",
          item_type: "relation-id",
          of_list: false,
          relation_type: "sentence",
        },
        {
          entity_id: 1,
          source: "test",
          key: "children",
          value: "4",
          item_type: "relation-id",
          of_list: true,
          relation_type: "symbol",
        },
        {
          entity_id: 1,
          source: "test",
          key: "children",
          value: "5",
          item_type: "relation-id",
          of_list: true,
          relation_type: "symbol",
        },
      ]);

      const payload: EntityUpdatePayload = {
        data: {
          id: "1",
          type: "symbol",
          attributes: {
            source: "patch-source",
          },
          relationships: {
            children: [{ type: "symbol", id: "6" }],
          },
        },
      };

      const response = await server.inject({
        method: "patch",
        url: "/api/v0/papers/arxiv:1111.1111/entities/1",
        payload,
      });

      expect(response.statusCode).toEqual(204);

      const entityDataRows: EntityDataRow[] = await knex("entitydata").select();
      expect(entityDataRows).toHaveLength(2);

      const sentenceRows: EntityDataRow[] = await knex("entitydata")
        .select()
        .where({ key: "sentence" });
      expect(sentenceRows[0]).toMatchObject({
        value: "3",
      });

      const childrenRows: EntityDataRow[] = await knex("entitydata")
        .select()
        .where({ key: "children" });
      expect(childrenRows).toHaveLength(1);
      expect(childrenRows[0]).toMatchObject({
        source: "patch-source",
        key: "children",
        value: "6",
        item_type: "relation-id",
        of_list: true,
        relation_type: "symbol",
      } as EntityDataRow);
    });
  });

  describe("DELETE /api/v0/papers/arxiv:{arxivId}/entites/{entityId}", () => {
    test("entity with bounding box and data", async () => {
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
          type: "unknown",
          source: "test",
        },
      ] as EntityRow[]);
      await knex.batchInsert("boundingbox", [
        {
          entity_id: 1,
          source: "test",
          page: 0,
          left: 0,
          top: 0,
          width: 0.1,
          height: 0.05,
        },
      ] as BoundingBoxRow[]);
      await knex.batchInsert("entitydata", [
        {
          entity_id: 1,
          source: "test",
          key: "key",
          value: "value",
          item_type: "string",
          of_list: false,
          relation_type: null,
        },
      ] as EntityDataRow[]);

      const response = await server.inject({
        method: "delete",
        url: "/api/v0/papers/arxiv:1111.1111/entities/1",
      });

      expect(response.statusCode).toEqual(204);
      expect(response.result).toBeNull();

      expect(await knex("entity").select()).toHaveLength(0);
      expect(await knex("boundingbox").select()).toHaveLength(0);
      expect(await knex("entitydata").select()).toHaveLength(0);
    });
  });
});
