var express = require("express");
var router = express.Router();
var { db } = require("../models");
var TodoService = require("../services/TodoService");
var todoService = new TodoService(db);
const { isAuth, validateBody, validateCategory, validateStatus, isTodoOwner } = require("../middleware/middleware");

/* Return all the logged in users todo's with the category associated with each todo and
status that is not the deleted status */
router.get("/", isAuth, async (req, res) => {
  /**
  #swagger.tags = ['Todo']
  #swagger.description = 'Endpoint to get a logged in users todos excluding todos with a deleted status'
  #swagger.produces = ["application/json"]
  #swagger.security = [{
      "bearerAuth": []
   }]
  #swagger.responses[200] = {description: 'OK', schema: {status: "success", data: {statusCode: 200, result: [{$ref: "#/definitions/TodoResponse"}]}}}
  #swagger.responses[500] = {status: "error", message: "Internal server error", data: {}}
  */
  try {
    const result = await todoService.findAllByUser(req.user.id);
    return res.status(200).jsend.success({ statusCode: 200, result });
  } catch (error) {
    console.log(error);
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

// Return all the users todos including todos with a deleted status
router.get("/all", isAuth, async (req, res) => {
  /**
   #swagger.tags = ['Todo']
   #swagger.description = 'Endpoint to get all todos for the logged in user'
   #swagger.produces = ["application/json"]
   #swagger.security = [{
      "bearerAuth": []
   }]
   #swagger.responses[200] = {description: 'OK', schema: {status: "success", data: {statusCode: 200, result: [{$ref: "#/definitions/TodoResponse"}]}}}
   #swagger.responses[500] = {description: 'Internal server error', schema: {status: "error", message: "Internal server error", data: {}}}
   */
  try {
    const result = await todoService.findAllByUser(req.user.id, true);
    return res.status(200).jsend.success({ statusCode: 200, result });
  } catch (error) {
    console.log(error);
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

// Return all the todos with the deleted status
router.get("/deleted", isAuth, async (req, res) => {
  /**
   #swagger.tags = ['Todo']
   #swagger.description = 'Endpoint to get all deleted todos for the logged in user'
   #swagger.produces = ["application/json"]
   #swagger.security = [{
      "bearerAuth": []
   }]
  #swagger.responses[200] = {description: 'OK', schema: {status: "success", data: {statusCode: 200, result: [{$ref: "#/definitions/TodoResponse"}]}}}
  #swagger.responses[500] = {description: 'Internal server error', schema: {status: "error", message: "Internal server error", data: {}}}
   */
  try {
    const result = await todoService.findAllDeletedByUser(req.user.id);
    return res.status(200).jsend.success({ statusCode: 200, result });
  } catch (error) {
    console.log(error);
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

// Add a new todo with their category for the logged in user
router.post("/", isAuth, validateBody, validateCategory, validateStatus, async (req, res) => {
  /**
  #swagger.tags = ['Todo']
  #swagger.description = 'Endpoint to create a todo for the logged in user'
  #swagger.parameters['body'] = { in: 'body', description: 'Todo name, description, statusId, categoryId', required: true, schema: {$ref: "#/definitions/TodoBody"} }
  #swagger.consumes = ["application/json"]
  #swagger.produces = ["application/json"]
  #swagger.security = [{
      "bearerAuth": []
    }]
  #swagger.responses[201] = {description: 'Todo created', schema: {status: "success", data: {statusCode: 201, result: {$ref: "#/definitions/Todo"}}}}
  #swagger.responses[403] = {description: 'Referenced resource is not owned by the user', schema: {status: "fail", data: {statusCode: 403, result: "You are not authorized to use this category"}}}
  #swagger.responses[500] = {description: 'Internal server error', schema: {status: "error", message: "Internal server error", data: {}}}
  */
  try {
    const { name, description, statusId, categoryId } = req.body;
    const userId = req.user.id;
    const result = await todoService.create(name, description, statusId, categoryId, userId);
    return res.status(201).jsend.success({ statusCode: 201, result });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

// Return all the statuses from the database
router.get("/statuses", isAuth, async (req, res) => {
  /**
  #swagger.tags = ['Todo']
  #swagger.description = 'Endpoint to get all statuses'
  #swagger.produces = ["application/json"]
  #swagger.security = [{
      "bearerAuth": []
  }]
  #swagger.responses[200] = {description: 'Statuses found', schema: {status: "success", data: {statusCode: 200, result: [{$ref: "#/definitions/Status"}]}}}
  #swagger.responses[500] = {description: 'Internal server error', schema: {status: "error", message: "Internal server error", data: {}}}
  */
  const statuses = await todoService.findAllStatuses();
  return res.status(200).jsend.success({ statusCode: 200, result: statuses });
});

// Change/update a specific todo for logged in user
router.put("/:id", isAuth, isTodoOwner, validateCategory, validateStatus, async (req, res) => {
  /**
  #swagger.tags = ['Todo']
  #swagger.description = 'Endpoint to update a todo for the logged in user'
  #swagger.parameters['id'] = { description: 'Todo id', type: 'integer' }
  #swagger.parameters['body'] = { in: 'body', description: 'Todo name, description, statusId, categoryId', type: 'object', schema: {$ref: "#/definitions/TodoBody"} }
  #swagger.consumes = ["application/json"]
  #swagger.produces = ["application/json"]
  #swagger.security = [{
      "bearerAuth": []
  }]
  #swagger.responses[200] = {description: 'Todo updated', schema: {status: "success", data: {statusCode: 200, result: "Todo updated"}}}
  #swagger.responses[403] = {description: 'Referenced resource is not owned by the user', schema: {status: "fail", data: {statusCode: 403, result: "You are not authorized to use this category"}}}
  #swagger.responses[404] = {description: 'Todo not found', schema: {status: "fail", data: {statusCode: 404, result: "Todo not found"}}}
  #swagger.responses[500] = {description: 'Internal server error', schema: {status: "error", message: "Internal server error", data: {}}}
  */
  try {
    const { name, description, statusId, categoryId } = req.body;
    const userId = req.user.id;
    const id = req.params.id;
    // only add defined values to the args object
    const args = {};
    if (name) args.name = name;
    if (description) args.description = description;
    if (statusId) args.StatusId = statusId;
    if (categoryId) args.CategoryId = categoryId;
    const result = await todoService.update(id, args);
    return res.status(200).jsend.success({ statusCode: 200, result: "Todo updated" });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

// Delete a specific todo if for the logged in user
router.delete("/:id", isAuth, isTodoOwner, async (req, res) => {
  /**
   #swagger.tags = ['Todo']
   #swagger.description = 'Endpoint to delete a todo for the logged in user'
   #swagger.parameters['id'] = { description: 'Todo id', type: 'integer' }
   #swagger.produces = ["application/json"]
   #swagger.security = [{
      "bearerAuth": []
   }]
   #swagger.responses[200] = {description: 'Todo deleted', schema: {status: "success", data: {statusCode: 200, result: "Todo deleted"}}}
   #swagger.responses[403] = {description: 'Referenced resource is not owned by the user', schema: {status: "fail", data: {statusCode: 403, result: "You are not authorized to delete this todo"}}}
   */
  try {
    const id = req.params.id;
    const result = await todoService.delete(id);
    return res.status(200).jsend.success({ statusCode: 200, result: "Todo deleted" });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

module.exports = router;
