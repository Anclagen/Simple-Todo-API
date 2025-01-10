const express = require("express");
const createError = require("http-errors");
const jsend = require("jsend");
const usersRouter = require("../routes/users");
const categoriesRouter = require("../routes/categories");
const todosRouter = require("../routes/todos");

// basic configuration for the express app to use in testing
function testAppFactory(db) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(jsend.middleware);

  // If your routers need the db, you can pass them here, or have them import from db
  app.use("/users", usersRouter);
  app.use("/category", categoriesRouter);
  app.use("/todos", todosRouter);

  app.use((req, res, next) => {
    next(createError(404));
  });

  return app;
}

module.exports = testAppFactory;
