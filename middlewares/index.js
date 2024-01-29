const validateBody = require("./validateBody");
const authentificate = require("./authentificate");
const isValidId = require("./isValidId");
const upload = require("./upload");
const passport = require("./google-authentificate")
module.exports = {
  validateBody,
  authentificate,
  isValidId,
  upload,
  passport
};
