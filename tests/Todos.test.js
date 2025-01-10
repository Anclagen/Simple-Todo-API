var createError = require("http-errors");
var express = require("express");
var jsend = require("jsend");
var usersRouter = require("../routes/users");
var categoriesRouter = require("../routes/categories");
var todosRouter = require("../routes/todos");
var { createDatabase, db } = require("../models");
var crypto = require("crypto");
const request = require("supertest");
const createStatuses = require("../utilities/createStatuses");
const { Sequelize } = require("sequelize");
require("dotenv").config();

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(jsend.middleware);
app.use("/users", usersRouter);
app.use("/category", categoriesRouter);
app.use("/todos", todosRouter);
app.use(function (req, res, next) {
  next(createError(404));
});

let user;
const name = "tester";
const email = "test@test.com";
const password = "password";

describe("Todo Tests", () => {
  beforeAll(async () => {
    // Using existing db but could uncomment and use a different db
    // const options = new Sequelize(process.env.TEST_DATABASE_NAME, process.env.TEST_ADMIN_USERNAME, process.env.TEST_ADMIN_PASSWORD, { host: process.env.TEST_HOST, dialect: process.env.DIALECT });
    // const db = await createDatabase(options);
    await db.sequelize.sync({ force: false });
    await createStatuses(db);
    const salt = crypto.randomBytes(16);
    const encryptedPassword = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256");
    user = await db.User.create({
      name,
      email,
      salt,
      encryptedPassword,
    });
  });

  test("Logging in with a valid account", async () => {
    const response = await request(app).post("/users/login").send({
      email,
      password,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.statusCode).toBe(200);
    expect(response.body.data.result).toBe("You are logged in");
    expect(response.body.data.token).toBeDefined();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });
});
