const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { emailRegex } = require("../constant/constant");

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      // match: emailRegex,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      minlength: 8,
      required: [true, "Password is required"],
    },
  },
  { versionKey: false }
);

// const userJoiSchema = Joi.object({
//   password: Joi.string().min(8).max(48).required().messages({
//     "string.base": `Password - should be a string type!`,
//     "string.empty": `Password - cannot be an empty!`,
//     "string.min": `Password - should have a minimum 8 symbols length!`,
//     "string.max": `Password should have a maximum 48 symbols length!`,
//     "any.required": `Password is a required!`,
//   }),
//   email: Joi.string().pattern(emailRegex).required().messages({
//     "string.bae": `Email - should be a string type!`,
//     "string.empty": `Email - cannot be an empty!`,
//     "any.required": `Email is a required!`,
//     "string.pattern.base": `Email - invalid pattern!`,
//   }),
// });

const User = model("User", userSchema);

module.exports = {User}