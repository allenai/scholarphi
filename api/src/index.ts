import * as nconf from "nconf";
import ApiServer from "./server";

nconf
  .argv()
  .env()
  .file({ file: process.env.SECRETS_FILE || "config/secret.json" })
  .defaults({
    database: {
      host: "scholarphi-db-prod.cluster-civm9kvdku8h.us-west-2.rds.amazonaws.com",
      port: 5432,
      database: "scholarphi",
      user: "api",
      schema: "public",
    },
  });

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

const server = new ApiServer(nconf, true);
server.init().then(() => server.start());
