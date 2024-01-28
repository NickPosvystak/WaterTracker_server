const Joi = require("joi");

const updateEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Missing required email field",
    "string.email": "Invalid email format",
    "string.empty": "Email cannot be empty",
  }),
});

module.exports = {
  updateEmailSchema,
};
