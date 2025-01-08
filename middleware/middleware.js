var jwt = require("jsonwebtoken");
var db = require("../models");
var CategoryService = require("../services/CategoryService");
var categoryService = new CategoryService(db);

// Middleware function to determine if the API endpoint request is from an authenticated user
function isAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // #swagger.responses[401] = {description: 'Unauthorized, malformed authorization header', schema: {status:"fail", data: {statusCode: 401, result: "Unauthorized, malformed authorization header"}}}
      return res.status(401).jsend.fail({
        data: { statusCode: 401, result: "Unauthorized, malformed authorization header" },
      });
    }

    // token errors are caught and handled in the catch
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    // Add the user id to the request object for use in the route
    req.user = { id: decodedToken.id };

    next();
  } catch (error) {
    const statusCode = error.name === "JsonWebTokenError" ? 401 : 500;
    const message = error.name === "JsonWebTokenError" ? error.message : "Internal server error";

    // If the error is a JsonWebTokenError, return a 401 status code
    if (statusCode === 401) {
      // #swagger.responses[401] = {description: 'Verification failed', schema: {status:"fail", data: {statusCode: 401, result: "Verification failed"}}}
      return res.status(statusCode).jsend.fail({ statusCode, result: message });
    }

    // #swagger.responses[500] = {description: 'Internal server error', schema: {status: "error", message: "Internal server error", data: {}}}
    return res.status(statusCode).jsend.error({ message });
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
      // #swagger.responses[403] = {description: 'You are not authorized to update this category', schema: {status: "fail", data: {statusCode: 403, result: "You are not authorized to update this category"}}}
      return res.status(403).jsend.fail({ statusCode: 403, result: "You are not authorized to update this category" });
    }

    next();
  } catch (error) {
    // #swagger.responses[500] = {description: 'Internal server error', schema: {status: "error", message: "Internal server error", data: {}}}
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
}

module.exports = {
  isAuth,
  isCategoryOwner,
};
