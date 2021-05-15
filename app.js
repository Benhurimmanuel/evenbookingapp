const express = require("express");
const app = express();
const cors = require("cors");
const graphqlHttp = require("express-graphql").graphqlHTTP;
// const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");

const graphQlResolvers = require("./graphql/resolvers/index");

const dotenv = require("dotenv");
dotenv.config();

app.use(cors());
app.use(express.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphQlSchema,

    // Graphl ql resolover
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

try {
  mongoose.connect(
    "mongodb+srv://Benhur:user123@cluster0.l4pqn.mongodb.net/eventbookingapp?retryWrites=true&w=majority",
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
