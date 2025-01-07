var express = require("express");
var router = express.Router();
var db = require("../models");
var CategoryService = require("../services/CategoryService");
var categoryService = new CategoryService(db);
const isAuth = require("../middleware/middleware");

router.get("/", isAuth, (req, res) => {
  return;
});

router.post("/", isAuth, (req, res) => {
  return;
});

router.put("/:id", isAuth, (req, res) => {
  return;
});

router.delete("/:id", isAuth, (req, res) => {
  return;
});

module.exports = router;
