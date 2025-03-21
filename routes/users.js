var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var { db } = require("../models");
var UserService = require("../services/UserService");
var userService = new UserService(db);
var crypto = require("crypto");
const { validateLoginBody, validateBodyName } = require("../middleware/middleware");

// Post for registered users to be able to login

router.post("/login", validateLoginBody, async (req, res, next) => {
  /* #swagger.tags = ['Auth']
   #swagger.description = 'Endpoint to login a user'
   #swagger.parameters['body'] = { 
      in: 'body', 
      required: true, 
      description: 'User email and password', 
      schema: { $ref: "#/definitions/UserBodyLogin" }
   }
   #swagger.responses[200] = {description: 'You are logged in', schema: {status: "success", data: {statusCode: 200, result: {id: 1, name: "John Doe", token: "token"}}}}
   #swagger.responses[400] = {description: 'Invalid email or password', schema: {status: "fail", data: {statusCode: 400, result: "Invalid email format"}}}
*/
  try {
    const { email, password } = req.body;
    const user = await userService.getOneEmail(email);

    if (!user) {
      return res.status(400).jsend.fail({ statusCode: 400, result: "Incorrect email or password" });
    }

    crypto.pbkdf2(password, user.salt, 310000, 32, "sha256", function (err, hashedPassword) {
      if (err) {
        return next(err);
      }

      if (!crypto.timingSafeEqual(user.encryptedPassword, hashedPassword)) {
        return res.status(400).jsend.fail({ statusCode: 400, result: "Incorrect email or password" });
      }

      const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
        expiresIn: 86400, // 24 hours
      });

      res.status(200).jsend.success({ statusCode: 200, result: { id: user.id, name: user.name, token } });
    });
  } catch (error) {
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

// Post for new users to register / signup
router.post("/signup", validateBodyName, validateLoginBody, async (req, res, next) => {
  /* #swagger.tags = ['Auth']
  #swagger.description = 'Endpoint to create a new user'
  #swagger.parameters['body'] = { in: 'body', required: true, description: 'User name, email and password', type: 'object', schema: {$ref: "#/definitions/UserBodySignUp"}} 
  #swagger.consumes = ["application/json"]
  #swagger.produces = ["application/json"] 
  #swagger.responses[200] = {description: 'You created an account', schema: {status: "success", data: {statusCode: 200, result: "You created an account"}}}
  #swagger.responses[400] = {description: 'Invalid email or password', schema: {status: "fail", data: {statusCode: 400, result: "Missing email or password in request body"}}}
  #swagger.responses[400] = {description: 'Email already exists', schema: {status: "fail", data: {statusCode: 400, result: "Email already exists"}}}
  #swagger.responses[500] = {description: 'Internal server error', schema: {status: "error", message: "Internal server error", data: {}}}
  */

  try {
    const { name, email, password } = req.body;
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
    return res.status(500).jsend.error({ status: "error", message: "Internal server error", data: error });
  }
});

router.get("/fail", (req, res) => {
  /* #swagger.tags = ['Auth']
  #swagger.description = 'Endpoint to test the fail response'
  #swagger.responses[401] = {description: 'Unauthorized, malformed authorization header', schema: {status:"fail", data: {statusCode: 401, result: "Unauthorized, malformed authorization header"}}}
  */
  return res.status(401).jsend.error({ statusCode: 401, message: "message", data: "data" });
});

module.exports = router;
