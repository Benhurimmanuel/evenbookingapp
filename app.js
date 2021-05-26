const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());
const graphqlHttp = require("express-graphql").graphqlHTTP;
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");

const graphQlResolvers = require("./graphql/resolvers/index");
const isAuth = require("./graphql/authorization/index");

const dotenv = require("dotenv");
dotenv.config();

app.use(express.json());
app.use(isAuth);
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

try {
  mongoose.connect(
    process.env.DB,
    { useUnifiedTopology: true, useNewUrlParser: true },
    () => {
      app.listen(process.env.PORT || 8080, function () {
        console.log("server is running");
      });
    }
  );
} catch (error) {
  handleError(error);
}
