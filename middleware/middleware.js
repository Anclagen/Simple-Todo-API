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
      // #swagger.responses[401] = {description: 'Unauthorized, malformed or missing authorization header', schema: {status:"fail", data: {statusCode: 401, result: "Unauthorized, malformed authorization header"}}}
      return res.status(401).jsend.fail({
        data: { statusCode: 401, result: "Unauthorized, malformed authorization header" },
      });
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

async function validateBody(req, res, next) {
  try {
    const { name, description, statusId, categoryId } = req.body;
    if (!name || !description || !statusId || !categoryId) {
      // #swagger.responses[400] = {description: 'Missing name, description, statusId or categoryId in request body', schema: {status: "fail", data: {statusCode: 400, result: "Missing name, description, statusId or categoryId in request body"}}}
      return res.status(400).jsend.fail({ statusCode: 400, result: "Missing name, description, statusId or categoryId in request body" });
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
    next();
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
      next();
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
  validateBody,
  validateCategory,
  validateStatus,
  isTodoOwner,
};
