var express = require("express");
var router = express.Router();
var db = require("../models");
var CategoryService = require("../services/CategoryService");
var categoryService = new CategoryService(db);
var TodoService = require("../services/TodoService");
var todoService = new TodoService(db);
const { isAuth, isCategoryOwner } = require("../middleware/middleware");

router.get("/", isAuth, async (req, res) => {
  /**
  #swagger.tags = ['Categories']
  #swagger.description = 'Endpoint to get all categories for the logged in user'
  #swagger.produces = ["application/json"]
  #swagger.security = [{
      "bearerAuth": []
   }]
   */
  try {
    const result = await categoryService.findAllByUser(req.user.id);
    // #swagger.responses[200] = {description: 'Categories found', schema: {status: "success", data: {statusCode: 200, result: [{id: 1, name: "Category Name", UserId: 1}, {id: 2, name: "Category Name", UserId: 1}]}}}
    return res.status(200).jsend.success({ statusCode: 200, result });
  } catch (error) {
    // #swagger.responses[500] = {status: "error", message: "Internal server error", data: {}}
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

router.post("/", isAuth, async (req, res) => {
  /**
  #swagger.tags = ['Categories']
  #swagger.description = 'Endpoint to create a new category for the logged in user'
  #swagger.parameters['body'] = { in: 'body', description: 'Category name', type: 'object', properties: {name: { type: 'string' }} }
  #swagger.consumes = ["application/json"]
  #swagger.produces = ["application/json"]
  #swagger.security = [{
      "bearerAuth": []
   }]
   */
  try {
    const { name } = req.body;
    const userId = req.user.id;
    if (!name) {
      return res.status(400).jsend.fail({ statusCode: 400, result: "Missing name in request body" });
    }
    const result = await categoryService.create(name, userId);
    return res.status(201).jsend.success({ statusCode: 201, result });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

router.put("/:id", isAuth, isCategoryOwner, async (req, res) => {
  /**
  #swagger.tags = ['Categories']
  #swagger.description = 'Endpoint to update a category for the logged in user'
  #swagger.parameters['id'] = { description: 'Category id', type: 'integer' }
  #swagger.parameters['body'] = { in: 'body', description: 'Category name', type: 'object', properties: {name: { type: 'string' }} }
  #swagger.consumes = ["application/json"]
  #swagger.produces = ["application/json"]
  #swagger.security = [{
      "bearerAuth": []
   }]
  #swagger.responses[200] = {description: 'Category updated', schema: {status: "success", data: {statusCode: 200, result: "Category updated"}}}
  #swagger.responses[400] = {description: 'Missing name in request body', schema: {status: "fail", data: {statusCode: 400, result: "Missing name in request body"}}}
  #swagger.responses[404] = {description: 'Category not found', schema: {status: "fail", data: {statusCode: 404, result: "Category not found"}}}
  */
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).jsend.fail({ statusCode: 400, result: "Missing name in request body" });
    }
    const result = await categoryService.update(req.params.id, name);

    if (!result) {
      return res.status(404).jsend.fail({ statusCode: 404, result: "Category not found" });
    }

    return res.status(200).jsend.success({ statusCode: 200, result: "Category updated" });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

router.delete("/:id", isAuth, isCategoryOwner, async (req, res) => {
  /**
  #swagger.tags = ['Categories']
  #swagger.description = 'Endpoint to delete a category for the logged in user'
  #swagger.parameters['id'] = { description: 'Category id', type: 'integer' }
  #swagger.produces = ["application/json"]
  #swagger.security = [{
      "bearerAuth": []
    }]
  #swagger.responses[200] = {description: 'Category deleted', schema: {status: "success", data: {statusCode: 200, result: "Category deleted"}}}
  #swagger.responses[404] = {description: 'Category not found', schema: {status: "fail", data: {statusCode: 404, result: "Category not found"}}}
  */
  try {
    // Check if there are any todos with the category
    const todos = await todoService.findAllByCategory(req.params.id);
    if (todos.length > 0) {
      return res.status(400).jsend.fail({ statusCode: 400, result: "Category has todos" });
    }

    const result = await categoryService.delete(req.params.id);
    if (!result) {
      return res.status(404).jsend.fail({ statusCode: 404, result: "Category not found" });
    }
    return res.status(200).jsend.success({ statusCode: 200, result: "Category deleted" });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

module.exports = router;
