const Category = require("./models/Category");

const swaggerAutogen = require("swagger-autogen")();
const doc = {
  info: {
    version: "1.0.0",
    title: "My TODOs",
    description: "A simple TODO app with user authentication and categories",
  },
  host: "localhost:3000",
  definitions: {
    Category: {
      id: 1,
      name: "Category Name",
      UserId: 1,
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./bin/www");
});
