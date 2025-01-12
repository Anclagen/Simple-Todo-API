var { createDatabase, db } = require("../models");
var crypto = require("crypto");
var testAppFactory = require("../utilities/testAppFactory");
const request = require("supertest");
const createStatuses = require("../utilities/createStatuses");
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Logging in with a valid account.
// Using the token from 1. to get all the users Todos.
// Using the token from 1. and add a new Todo item.
// Deleting the created Todo item from number 3.
// Trying to get Todos without sending JWT token in the header.
// Trying to get Todos by sending an invalid JWT token.

describe("Todo Tests", () => {
  // Variables to be used in the tests
  let user;
  let category;
  let token;
  let statuses;
  let todo;
  let todo2;
  const name = "tester";
  const email = "test@test.com";
  const password = "password";

  let app;

  // Create a new database for testing needs refactoring of routes to use the test database, as db is imported in routes
  // const options = new Sequelize(
  //   process.env.TEST_DATABASE_NAME || process.env.DATABASE_NAME,
  //   process.env.TEST_ADMIN_USERNAME || process.env.ADMIN_USERNAME,
  //   process.env.TEST_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD,
  //   { host: process.env.TEST_HOST || process.env.HOST, dialect: process.env.DIALECT, logging: false }
  // );
  // Create a database for testing
  // const db = createDatabase(options);

  beforeAll(async () => {
    // Force true would be better for testing but it would delete all the data in the database if not using a test database
    await db.sequelize.sync({ force: false });
    await createStatuses(db);
    // Create a new user for testing
    const salt = crypto.randomBytes(16);
    const encryptedPassword = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256");
    user = await db.User.create({
      name,
      email,
      salt,
      encryptedPassword,
    });

    // create a new category for testing with the user id
    category = await db.Category.create({
      name: "test",
      UserId: user.id,
    });

    // get statuses
    statuses = await db.Status.findAll();

    // create a new todo for testing
    todo = await db.Todo.create({
      name: "test",
      description: "test",
      StatusId: statuses[0].id,
      CategoryId: category.id,
      UserId: user.id,
    });

    console.log(user.id, user.email, category.id, statuses[0].id);

    // Create the app for testing
    app = testAppFactory(db);
  });

  test("Logging in with a valid account", async () => {
    const response = await request(app).post("/users/login").send({
      email,
      password,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.statusCode).toBe(200);
    expect(response.body.data.result.id).toBe(user.id);
    expect(response.body.data.result.name).toBe(user.name);
    expect(response.body.data.result.token).toBeDefined();

    token = response.body.data.result.token;
  });

  test("Get all the users Todos", async () => {
    const response = await request(app).get("/todo").set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.statusCode).toBe(200);
    expect(response.body.data.result).toBeDefined();
    expect(response.body.data.result[0].name).toBe("test");
    expect(response.body.data.result[0].description).toBe("test");
  });

  test("Add a new Todo item", async () => {
    const response = await request(app).post("/todo").set("Authorization", `Bearer ${token}`).send({
      name: "test2",
      description: "test2",
      statusId: statuses[0].id,
      categoryId: category.id,
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data.statusCode).toBe(201);
    expect(response.body.data.result.name).toBe("test2");
    expect(response.body.data.result.description).toBe("test2");
    todo2 = response.body.data.result;
  });

  test("Delete the created Todo item", async () => {
    const response = await request(app).delete(`/todo/${todo2.id}`).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.statusCode).toBe(200);
    expect(response.body.data.result).toBeDefined();
    // Check if the status is deleted
    const deletedTodo = await request(app).get(`/todo/deleted`).set("Authorization", `Bearer ${token}`);
    expect(deletedTodo.body.data.result[0].Status.status).toBe("Deleted");
  });

  test("Get Todos without sending JWT token in the header", async () => {
    const response = await request(app).get("/todo");
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.data.statusCode).toBe(401);
    expect(response.body.data.result).toBeDefined();
  });

  test("Get Todos by sending an invalid JWT token", async () => {
    const response = await request(app).get("/todo").set("Authorization", `Bearer ${token}1`);
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.data.statusCode).toBe(401);
    expect(response.body.data.result).toBeDefined();
  });

  afterAll(async () => {
    // Delete the user and all associated data
    todo?.id && (await db.Todo.destroy({ where: { id: todo.id } }));
    todo2?.id && (await db.Todo.destroy({ where: { id: todo2.id } }));
    category?.id && (await db.Category.destroy({ where: { id: category.id } }));
    user?.id && (await db.User.destroy({ where: { id: user.id } }));
    await db.sequelize.close();
  });
});
