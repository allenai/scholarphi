import * as Hapi from "@hapi/hapi";
import * as Joi from "@hapi/joi";

export const init = async () => {
  const server = new Hapi.Server({
    port: 3000,
    host: "localhost"
  });

  server.route({
    method: "GET",
    path: "/{s2id}/citations",
    handler: request => {
      const s2id = request.params.s2id;
      return { key: "value", another_key: 2, s2id };
    },
    options: {
      validate: {
        params: Joi.object({
          s2id: Joi.string()
            .alphanum()
            .length(40)
        })
      }
    }
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});
