const Joi = require("joi");
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const userUpdateSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).messages({
    "string.base": "Email must be text",
    "string.pattern.base": "Entered email is not valid",
  }),
  name: Joi.string()
    .min(2)
    .max(32)
    .pattern(/^[a-zA-Zа-яА-ЯёЁ\s]+(?:-[a-zA-Zа-яА-ЯёЁ\s]+)*$/).optional()
    .messages({
      "string.base": "Name must be a string",
      "string.min": "Name must have at least {{#limit}} characters",
      "string.max": "Name must have at most {{#limit}} characters",
      "string.pattern.base": "Entered name is not valid",
    }),
  newPassword: Joi.string().min(8).max(64).messages({
    "string.base": "Password must be a string",
    "string.min": "Password must be at least 8 characters long",
  }),
  gender: Joi.string().valid("male", "female").messages({
    "any.only": "Gender must be either 'male' or 'female'",
  }),
  currentPassword: Joi.when("newPassword", {
    is: Joi.exist(),
    then: Joi.string().min(8),
  }),
});
  // .or("email", "name", "password", "gender")
  // .messages({
  //   "object.missing":
  //     "At least one of 'email', 'name', 'password', or 'gender' must be provided",
  // });

module.exports = {
  userUpdateSchema,
};
