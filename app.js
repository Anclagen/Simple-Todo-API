var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var jsend = require("jsend");

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");

var usersRouter = require("./routes/users");
var categoriesRouter = require("./routes/categories");
var todosRouter = require("./routes/todos");

var createStatuses = require("./utilities/createStatuses");
var { db } = require("./models");

db.sequelize.sync({ force: false }).then(async () => {
  createStatuses(db);
});

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Globally add jsend to the response object
app.use(jsend.middleware);
app.use("/users", usersRouter);
app.use("/category", categoriesRouter);
app.use("/todos", todosRouter);

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
