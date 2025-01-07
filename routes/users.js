var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var db = require("../models");
var UserService = require("../services/UserService");
var userService = new UserService(db);
var crypto = require("crypto");
var jsend = require("jsend");
router.use(jsend.middleware);

// Post for registered users to be able to login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).jsend.fail({ statusCode: 400, result: "Missing email or password in request body" });
    }

    const user = await userService.getOneEmail(email);

    if (!user) {
      return res.status(400).jsend.fail({ statusCode: 400, result: "Incorrect email or password" });
    }

    crypto.pbkdf2(password, user.salt, 310000, 32, "sha256", function (err, hashedPassword) {
      if (err) {
        return next(err);
      }

      if (!crypto.timingSafeEqual(user.encryptedPassword, hashedPassword)) {
        return res.jsend.fail({ statusCode: 400, result: "Incorrect email or password" });
      }

      const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
        expiresIn: 86400, // 24 hours
      });

      res.jsend.success({ statusCode: 200, result: "You are logged in", token });
    });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", result: error });
  }
});

// Post for new users to register / signup
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if name, email or password is missing
    if (!name || !email || !password) {
      return res.status(400).jsend.fail({ statusCode: 400, result: "Missing name, email or password in request body" });
    }

    // Check if email already exists
    const user = await userService.getOneEmail(email);
    if (user) {
      return res.status(400).jsend.fail({ statusCode: 400, result: "Email already exists" });
    }

    // salt and hash password before saving to database
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 32, "sha256", function (err, hashedPassword) {
      if (err) {
        return next(err);
      }
      userService.create(name, email, hashedPassword, salt);
      res.jsend.success({ statusCode: 200, result: "You created an account." });
    });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", result: error });
  }
});

router.get("/fail", (req, res) => {
  return res.status(401).jsend.error({ statusCode: 401, message: "message", data: "data" });
});

module.exports = router;
