const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");
const Joi = require("joi");
const { gender, emailRegex } = require("../constant/constant");

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    passwordOne: {
      type: String,
      minLength: 8,
      required: [true, "Password is required"],
    },
    passwordTwo: {
      type: String,
      minLength: 8,
      required: [true, "Password is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    token: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
    gender: {
      type: String,
      enum: [...Object.values(gender)],
      default: null,
    },
    dailyNorma: {
      type: Number,
      default: null,
    },
    avatarURL: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);
userSchema.post("save", handleMongooseError);

const userRegisterSchema = Joi.object({
  name: Joi.string().messages({
    "string.base": "Name must be text",
  }),
  email: Joi.string().pattern(emailRegex).required().messages({
    "any.required": "Missing required email field",
    "string.base": "Email must be text",
    "string.pattern.base": "Entered email is not valid",
  }),
  passwordOne: Joi.string().min(8).required().messages({
    "any.required": "Missing required password field",
    "string.base": "Password must be text",
  }),
  passwordTwo: Joi.string().min(8).required().messages({
    "any.required": "Missing required password field",
    "string.base": "Password must be text",
  }),
});

const emailSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required().messages({
    "any.required": "Missing required email field",
    "string.base": "Email must be text",
    "string.pattern.base": "Entered email is not valid",
  }),
});

const userLoginSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required().messages({
    "any.required": "Missing required email field",
    "string.base": "Email must be text",
    "string.pattern.base": "Entered email is not valid",
  }),
  password: Joi.string().min(8).required().messages({
    "any.required": "Missing required password field",
    "string.base": "Password must be text",
  }),
});

const schemas = {
  userRegisterSchema,
  userLoginSchema,
  emailSchema,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
