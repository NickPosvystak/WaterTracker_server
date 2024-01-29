const catchAsync = require("./catchAsync");
const handleMongooseError = require("./handleMongooseError");
const ctrlWrapper = require("./ctrlWrapper");
const { updateEmailSchema } = require("./joiUpdateValid");
const { updateNameSchema } = require("./joiUpdateValid");
const { updatePasswordSchema } = require("./joiUpdateValid");

module.exports = {
  catchAsync,
  handleMongooseError,
  ctrlWrapper,
  HttpError: require("./httpError"),
  sendEmail: require("./sendEmail"),
  updateEmailSchema,
  updateNameSchema,
  updatePasswordSchema,
};
