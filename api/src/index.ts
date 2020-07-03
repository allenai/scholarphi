import * as nconf from "nconf";
import { init, start } from "./server";

nconf
  .argv()
  .env()
  .file({ file: process.env.SECRETS_FILE || "config/secret.json" })
  .defaults({
    database: {
      host: "scholar-reader.c5tvjmptvzlz.us-west-2.rds.amazonaws.com",
      port: 5432,
      database: "scholar-reader",
      user: "api",
      schema: "public",
    },
  });

init(nconf).then((server) => start(server));
