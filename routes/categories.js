var express = require("express");
var router = express.Router();
var db = require("../models");
var CategoryService = require("../services/CategoryService");
var categoryService = new CategoryService(db);
const { isAuth, isCategoryOwner } = require("../middleware/middleware");

router.get("/", isAuth, async (req, res) => {
  try {
    const result = await categoryService.findAllByUser(req.user.id);
    return res.status(200).jsend.success({ statusCode: 200, result });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

router.post("/", isAuth, async (req, res) => {
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
  try {
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
