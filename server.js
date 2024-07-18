const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const schemaWithMiddleware = require("./schemaWithMiddleware");

require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 3000;
async function startApolloServer() {
  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    context: ({ req }) => ({ req }),
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
//Apollo Client available at "/graphql" for testing

startApolloServer();
