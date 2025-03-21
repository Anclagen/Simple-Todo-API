var jwt = require("jsonwebtoken");
var { db } = require("../models");
var CategoryService = require("../services/CategoryService");
var categoryService = new CategoryService(db);
var TodoService = require("../services/TodoService");
var todoService = new TodoService(db);

// Middleware function to determine if the API endpoint request is from an authenticated user
function isAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // #swagger.responses[401] = {description: 'Unauthorized, malformed or missing authorization header', schema: {status:"fail", data: {statusCode: 401, result: "Unauthorized, malformed or missing authorization header"}}}
      return res.status(401).jsend.fail({ statusCode: 401, result: "Unauthorized, malformed or missing authorization header" });
    }

    // token errors are caught and handled in the catch
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
      // Add the user id to the request object for use in the route
      req.user = { id: decodedToken.id };
    } catch (error) {
      return res.status(401).jsend.fail({ statusCode: 401, result: error.message });
    }

    next();
  } catch (error) {
    // #swagger.responses[500] = {description: 'Internal server error', schema: {status: "error", message: "Internal server error", data: {}}}
    return res.status(500).jsend.error({ message: "Internal Server Error", data: error });
  }
}

async function isCategoryOwner(req, res, next) {
  try {
    // Check if the category exists

    if (isNaN(req.params.id)) {
      // #swagger.responses[400] = {description: 'Invalid category id', schema: {status: "fail", data: {statusCode: 400, result: "Invalid category id"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Category id must be a number" });
    }

    const category = await categoryService.findOne(req.params.id);
    if (!category) {
      // #swagger.responses[404] = {description: 'Category not found', schema: {status: "fail", data: {statusCode: 404, result: "Category not found"}}}
      return res.status(404).jsend.fail({ statusCode: 404, result: "Category not found" });
    }

    // Check if the user is the owner of the category
    if (category.UserId !== req.user.id) {
      // #swagger.responses[403] = {description: 'You are not authorized to update this entity', schema: {status:"fail", data: {statusCode: 403, result: "You are not authorized to update this category"}}}
      return res.status(403).jsend.fail({ statusCode: 403, result: "You are not authorized to update this category" });
    }

    next();
  } catch (error) {
    // #swagger.responses[500] = {description: 'Internal server error', schema: {status: "error", message: "Internal server error", data: {}}}
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
}

async function validateTodoBody(req, res, next) {
  try {
    const { name, description, statusId, categoryId } = req.body;
    if (!name || !description || !statusId || !categoryId) {
      // #swagger.responses[400] = {description: 'Missing name, description, statusId or categoryId in request body', schema: {status: "fail", data: {statusCode: 400, result: "Missing name, description, statusId or categoryId in request body"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Missing name, description, statusId or categoryId in request body" });
    }

    if (typeof name !== "string" || typeof description !== "string" || typeof statusId !== "number" || typeof categoryId !== "number") {
      // #swagger.responses[400] = {description: 'Invalid data type in request body', schema: {status: "fail", data: {statusCode: 400, result: "Invalid data type in request body"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Invalid data type in request body" });
    }

    next();
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
}

async function validateLoginBody(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      // #swagger.responses[400] = {description: 'Missing email or password in request body', schema: {status: "fail", data: {statusCode: 400, result: "Missing email or password in request body"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Missing email or password in request body" });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      // #swagger.responses[400] = {description: 'Invalid data type in request body', schema: {status: "fail", data: {statusCode: 400, result: "Invalid data type in request body"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Invalid data type in request body" });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      // #swagger.responses[400] = {description: 'Invalid email format', schema: {status: "fail", data: {statusCode: 400, result: "Invalid email format"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Invalid email format" });
    }

    next();
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
}

async function validateBodyName(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) {
      // #swagger.responses[400] = {description: 'Missing name in request body', schema: {status: "fail", data: {statusCode: 400, result: "Missing name in request body"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Missing name in request body" });
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      // #swagger.responses[400] = {description: 'Invalid data type in request body', schema: {status: "fail", data: {statusCode: 400, result: "Name must be a string and at least one character"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Name must be a string and at least one character" });
    }

    next();
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
}

// Optional check for statusId, place after validateTodoBody for creating a todo
async function validateCategory(req, res, next) {
  const { categoryId } = req.body;

  // If no categoryId is provided, move to the next middleware
  if (!categoryId) {
    return next();
  }

  if (typeof categoryId !== "number") {
    // #swagger.responses[400] = {description: 'Invalid data type in request body', schema: {status: "fail", data: {statusCode: 400, result: "Invalid data type in request body"}}}
    return res.status(400).jsend.fail({ statusCode: 400, result: "Category ID must be a number" });
  }

  const category = await categoryService.findOne(categoryId);
  if (!category) {
    // #swagger.responses[404] = {description: 'Referenced resource does not exist', schema: {status: "fail", data: {statusCode: 404, result: "Category not found"}}}
    return res.status(404).jsend.fail({ statusCode: 404, result: "Category not found" });
  }

  if (category.UserId !== req.user.id) {
    return res.status(403).jsend.fail({ statusCode: 403, result: "You are not authorized to use this category" });
  }

  next();
}

// Optional check for statusId, place after validateTodoBody for creating a todo
async function validateStatus(req, res, next) {
  try {
    const { statusId } = req.body;

    // If no statusId is provided, move to the next middleware
    if (!statusId) {
      return next();
    }

    if (typeof statusId !== "number") {
      // #swagger.responses[400] = {description: 'Invalid data type in request body', schema: {status: "fail", data: {statusCode: 400, result: "Status ID must be a number"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Status ID must be a number" });
    }

    const status = await todoService.findOneStatus(statusId);
    if (!status) {
      // #swagger.responses[404] = {description: 'Referenced resource does not exist', schema: {status: "fail", data: {statusCode: 404, result: "Status not found"}}}
      return res.status(404).jsend.fail({ statusCode: 404, result: "Status not found" });
    }
    next();
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
}

async function isTodoOwner(req, res, next) {
  try {
    if (isNaN(req.params.id)) {
      // #swagger.responses[400] = {description: 'Invalid todo id', schema: {status: "fail", data: {statusCode: 400, result: "Invalid todo id"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Todo id must be a number" });
    }

    const todo = await todoService.findOne(req.params.id);
    if (!todo) {
      // #swagger.responses[404] = {description: 'Referenced resource does not exist', schema: {status: "fail", data: {statusCode: 404, result: "Todo not found"}}}
      return res.status(404).jsend.fail({ statusCode: 404, result: "Todo not found" });
    }

    if (todo.UserId !== req.user.id) {
      return res.status(403).jsend.fail({ statusCode: 403, result: "You are not authorized to delete this todo" });
    }

    next();
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
}

module.exports = {
  isAuth,
  isCategoryOwner,
  validateTodoBody,
  validateLoginBody,
  validateBodyName,
  validateCategory,
  validateStatus,
  isTodoOwner,
};
