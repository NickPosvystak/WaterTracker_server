const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { HttpError } = require("../helpers/index.js");
const { ctrlWrapper } = require("../decorators/index.js");

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        throw HttpError(401, "Authorization header not found");
    }

    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
        throw HttpError(401);
    }
    try {
        const { id } = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(id);
        if (!user || !user.token || user.token !== token) {
            throw HttpError(401, "User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        throw HttpError(401, error.message);
    }
};

module.exports = ctrlWrapper(authenticate);
