var jwt = require("jsonwebtoken");

// Middleware function to determine if the API endpoint request is from an authenticated user
function isAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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
      return res.status(statusCode).jsend.fail({ statusCode, result: message });
    }

    // Unexpected errors return a 500 status code
    return res.status(statusCode).jsend.error({ message });
  }
}
module.exports = isAuth;
