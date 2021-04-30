import * as nconf from "nconf";
import ApiServer from "./server";
import { Config } from "./conf";

nconf
  .argv()
  .env()
  .overrides({
    database: {
      port: 5432,
      schema: "dev",
      host: "scholar-reader.c5tvjmptvzlz.us-west-2.rds.amazonaws.com",
      database: "scholar-reader",
    },
  })
  .file({ file: process.env.SECRETS_FILE || "config/secret.json" })
  .defaults({
    database: {
      port: 5432,
      schema: "public",
    },
  });

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

const server = new ApiServer(Config.fromConfig(nconf), true);
server.init().then(() => server.start());
