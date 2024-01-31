const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");
const { HttpError } = require("../helpers");
const { JWT_SECRET } = process.env;

const authentificate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    return next(HttpError(401, "Unauthorized"));
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(id);

    if (!user) {
      return next(HttpError(401, "User not found"));
    }

    if (user.token !== token) {
      return next(HttpError(401, "Unauthorized"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(HttpError(401, "Not authorized"));
  }
};

module.exports = authentificate;