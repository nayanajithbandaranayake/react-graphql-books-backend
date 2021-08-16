const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors());

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
  })
);

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}...`);
});
