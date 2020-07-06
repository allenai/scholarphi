import * as Knex from "knex";
import ApiServer from "../server";
import {
  Citation,
  DataResponse,
  Entity,
  EntityPatchPayload,
  EntityPostPayload,
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
          entity_id: 2,
          source: "test",
          type: "scalar",
          key: "mathml",
          value: "<math></math>",
        },
        {
          entity_id: 2,
          source: "test",
          type: "scalar-list",
          key: "mathml_near_matches",
          value: "<math><mi>x</mi></math>",
        },
        {
          entity_id: 2,
          source: "test",
          type: "scalar-list",
          key: "mathml_near_matches",
          value: "<math><mi>y</mi></math>",
        },
        {
          entity_id: 2,
          source: "test",
          type: "reference",
          key: "sentence",
          value: "3",
        },
        {
          entity_id: 2,
          source: "test",
          type: "reference-list",
          key: "children",
          value: "4",
        },
        {
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
          entity_id: 2,
          source: "test",
          type: "scalar",
          key: "unknown_property_1",
          value: "1",
        },
        {
          entity_id: 2,
          source: "test",
          type: "scalar-list",
          key: "unknown_property_2",
          value: "1",
        },
        {
          entity_id: 2,
          source: "test",
          type: "reference",
          key: "unknown_property_3",
          value: "1",
        },
        {
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
          entity_id: 3,
          source: "test",
          type: "scalar",
          key: "text",
          value: "Sentence.",
        },
        {
          entity_id: 3,
          source: "test",
          type: "scalar",
          key: "text",
          value: "Sentence.",
        },
        {
          entity_id: 3,
          source: "test",
          type: "scalar",
          key: "tex_start",
          value: "0",
        },
        {
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

      const payload: EntityPostPayload = {
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

      const payload: EntityPostPayload = {
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

      const payload: EntityPostPayload = {
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
        type: "scalar",
        source: "test",
        key: "paper_id",
        value: "citation_paper_id",
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

      const payload: EntityPostPayload = {
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
    /*
     * Patching a symbol can involve changing generic entity attributes, bounding boxes, and
     * attributes specific to symbols. All three changes are tested here.
     */
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
          id: 1,
          paper_id: "s2id",
          version: 0,
          type: "symbol",
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
          type: "scalar",
          key: "mathml",
          value: "<math></math>",
        },
        {
          entity_id: 1,
          source: "test",
          type: "scalar-list",
          key: "mathml_near_matches",
          value: "<math><mi>x</mi></math>",
        },
        {
          entity_id: 1,
          source: "test",
          type: "scalar-list",
          key: "mathml_near_matches",
          value: "<math><mi>y</mi></math>",
        },
        {
          entity_id: 1,
          source: "test",
          type: "reference",
          key: "sentence",
          value: "3",
        },
        {
          entity_id: 1,
          source: "test",
          type: "reference-list",
          key: "children",
          value: "4",
        },
        {
          entity_id: 1,
          source: "test",
          type: "reference-list",
          key: "children",
          value: "5",
        },
      ]);

      const payload: EntityPatchPayload = {
        data: {
          id: "1",
          type: "symbol",
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
            mathml: "<math><mi>z</mi></math>",
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

      expect(response.statusCode).toEqual(200);
      expect((response.result as any).data).toBeUndefined();

      const entityRows: EntityRow[] = await knex("entity").select();
      expect(entityRows).toHaveLength(1);
      expect(entityRows[0]).toMatchObject({
        source: "patch-source",
      } as EntityRow);

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

      const mathMlRows: EntityDataRow[] = await knex("entitydata")
        .select()
        .where({ key: "mathml" });
      expect(mathMlRows).toHaveLength(1);
      expect(mathMlRows[0]).toMatchObject({
        value: "<math><mi>z</mi></math>",
        source: "patch-source",
      });

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
        type: "reference-list",
        key: "children",
        value: "6",
      });
    });
  });
});
