const validateBody = require("./validateBody");
const authentificate = require("./authentificate");
const isValidId = require("./isValidId");
const upload = require("./upload");
const passport = require("./google-authentificate");
const checkUpdateMyPassword = require("./userMiddleware");

module.exports = {
  validateBody,
  authentificate,
  isValidId,
  upload,
  passport,
  checkUpdateMyPassword,
};
