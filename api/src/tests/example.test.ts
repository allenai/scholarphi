import { Server } from "@hapi/hapi";
import * as Knex from "knex";
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

describe("GET /", () => {
  let server: Server;
  let knex: Knex;

  beforeEach(async () => {
    server = await initServerWithTestDatabase();
    knex = createDefaultQueryBuilder();
  });

  afterEach(async () => {
    await server.stop();
    knex.destroy();
  });

  it("runs", async () => {
    const res = await server.inject({
      method: "get",
      url: "/health",
    });
    expect(res.statusCode).toEqual(200);
  });
});
