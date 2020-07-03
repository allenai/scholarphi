import * as fs from "fs";
import * as nconf from "nconf";
import { createQueryBuilder, extractConnectionParams } from "../db-connection";
import { init } from "../server";

/**
 * Configure the tests to connect to a test database instead of the production database.
 * Compare this configuration to the one initalized in 'index.ts'.
 */
nconf
  .argv()
  .env()
  .file({ file: process.env.SECRETS_FILE || "config/secret.json" })
  .defaults({
    /**
     * By default, tests will run in the shared remote database. This will cause problems if
     * multiple people are running tests simultaneously. In that case, each developer should
     * create their own local version of the test database, and use environment variables to
     * point the tests to the test database.
     */
    database: {
      host: "scholar-reader.c5tvjmptvzlz.us-west-2.rds.amazonaws.com",
      port: 5432,
      database: "scholar-reader-test",
      user: "api",
      schema: "test",
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
    await knex.raw(createTestTablesSql);
    console.log("Initialization of database schema for tests was successful.");
  } catch (err) {
    console.log("Error initializing test schema:", err);
  }
  knex.destroy();
}

/**
 * Get a query builder that can be used to insert or inspect test data.
 */
export function createDefaultQueryBuilder() {
  return createQueryBuilder(connectionParams);
}

export async function teardownTestDatabase() {
  const knex = createQueryBuilder(connectionParamsWithoutSchema);
  await knex.raw("DROP SCHEMA IF EXISTS test CASCADE");
  knex.destroy();
}

/**
 * It is expected that a 'test' Postgres database has already been created. The location of
 * the 'test' database can be set using command line arguments or environment variables. See
 * the 'nconf' configuration in this file for defaults and what keys to set.
 */
export async function initServerWithTestDatabase() {
  return await init(nconf);
}
