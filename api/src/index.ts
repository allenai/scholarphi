import * as nconf from "nconf";
import ApiServer from "./server";

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
      schema: "ray_error_1",
    },
  });

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

const server = new ApiServer(nconf, true);
server.init().then(() => server.start());
