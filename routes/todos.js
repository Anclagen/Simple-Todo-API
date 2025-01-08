var express = require("express");
var router = express.Router();
var db = require("../models");
var TodoService = require("../services/TodoService");
var todoService = new TodoService(db);
const { isAuth } = require("../middleware/middleware");

/* Return all the logged in users todo's with the category associated with each todo and
status that is not the deleted status */
router.get("/", isAuth, async (req, res) => {
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
  try {
    const result = await todoService.findAllDeletedByUser(req.user.id);
    return res.status(200).jsend.success({ statusCode: 200, result });
  } catch (error) {
    console.log(error);
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

// Add a new todo with their category for the logged in user
router.post("/", isAuth, async (req, res) => {
  try {
    const { name, description, statusId, categoryId } = req.body;
    const userId = req.user.id;
    if (!name || !description || !statusId || !categoryId) {
      return res.status(400).jsend.fail({ statusCode: 400, result: "Missing name, description, statusId or categoryId in request body" });
    }
    const result = await todoService.create(name, description, statusId, categoryId, userId);
    return res.status(201).jsend.success({ statusCode: 201, result });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

// Return all the statuses from the database
router.get("/statuses", isAuth, async (req, res) => {
  const statuses = await todoService.findAllStatuses();
  return res.status(200).jsend.success({ statusCode: 200, result: statuses });
});

// Change/update a specific todo for logged in user
router.put("/:id", isAuth, async (req, res) => {
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
    return res.status(200).jsend.success({ statusCode: 200, result });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

// Delete a specific todo if for the logged in user
router.delete("/:id", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const todo = await todoService.findOne(id);
    if (!todo) {
      return res.status(404).jsend.fail({ statusCode: 404, result: "Todo not found" });
    }

    if (todo.UserId !== userId) {
      return res.status(403).jsend.fail({ statusCode: 403, result: "You are not authorized to delete this todo" });
    }

    const result = await todoService.delete(id);
    return res.status(200).jsend.success({ statusCode: 200, result });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

module.exports = router;
