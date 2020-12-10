import * as fs from "fs";
import * as Knex from "knex";
import * as nconf from "nconf";
import { createQueryBuilder, extractConnectionParams } from "../db-connection";
import { default as APIServer } from "../server";

/**
 * Configure the tests to connect to a test database instead of thte production database.
 * Compare this configuration to the one initalized in 'index.ts'.
 * Make sure you run `./bin/start_local_db.sh` before running this.
 */
nconf
  .argv()
  .env()
  .defaults({
    database: {
      host: "localhost",
      port: 5555,
      database: "scholar-reader",
      user: "postgres",
      password: "pdfsarefun",
      schema: "test"
    },
  });

const connectionParams = extractConnectionParams(nconf);
const connectionParamsWithoutSchema = { ...connectionParams };
delete connectionParamsWithoutSchema.schema;

export async function setupTestDatabase() {
  /**
   * When initializing the test database, the default schema used in the tests (named 'test')
   * doesn't yet exist. So the schema property should be left out from this first database connection.
   */
  let knex = createQueryBuilder(connectionParamsWithoutSchema);

  const createTestTablesSql = fs
    .readFileSync("src/tests/create_test_tables.sql")
    .toString();

  console.log("Initializing database schema for tests...");
  try {
    await knex.raw("DROP SCHEMA IF EXISTS test CASCADE;");
    await knex.raw(createTestTablesSql);
    console.log("Initialization of database schema for tests was successful.");
  } catch(err) {
    console.log("Error initializing test schema:", err);
  }
  knex.destroy();
}

/**
 * Use this to reset the data in the database between tests.
 */
export async function truncateTables(knex: Knex, tables?: string[]) {
  tables = tables || [
    "paper",
    "version",
    "entity",
    "boundingbox",
    "entitydata",
  ];
  for (const table of tables) {
    await knex.raw(`TRUNCATE TABLE ${table} CASCADE`);
  }
}

export async function teardownTestDatabase() {
  const knex = createQueryBuilder(connectionParamsWithoutSchema);
  await knex.raw("DROP SCHEMA IF EXISTS test CASCADE");
  knex.destroy();
}

/**
 * Get a query builder that can be used to insert or inspect test data.
 */
export function createDefaultQueryBuilder() {
  return createQueryBuilder(connectionParams);
}

export async function initServer() {
  const server = new APIServer(nconf, true);
  await server.init();
  return server;
}
