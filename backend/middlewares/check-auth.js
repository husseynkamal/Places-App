const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new Error("Authentication failed!");
  }
  try {
    const token = authHeader.split(" ")[1];
    if (!token || token === "") {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    const error = new HttpError(err.message, 403);
    return next(error);
  }
};
