const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const db = require("./configs/db");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { applyMiddleware } = require("graphql-middleware");
const { loadFilesSync } = require("@graphql-tools/load-files");
const { validateLoginInput } = require("./mid/validations/validations");

require("dotenv").config();

const typesArray = loadFilesSync("**/*", {
  extensions: ["graphql"],
});

const ResolverArray = loadFilesSync("**/*", {
  extensions: ["resolvers.js"],
});

const PORT = process.env.PORT || 3000;
async function startApolloServer() {
  const app = express();

  const schema = makeExecutableSchema({
    typeDefs: typesArray,
    resolvers: ResolverArray,
    context: ({ req }) => ({ req }),
  });

  const schemaWithMiddleware = applyMiddleware(schema, {
    Mutation: {
      login: validateLoginInput,
    },
  });

  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    formatError: (err) => {
      // Format the error to include necessary information

      return {
        message: err.message,
        path: err.path,
        locations: err.locations,
        // extensions: err.extensions,
      };
    },
  });

  await server.start();

  server.applyMiddleware({
    app,
    path: "/graphql",
  });

  app.listen(PORT, () => {
    console.log(`Running graphQL Server on port ${PORT}`);
  });
}

startApolloServer();
