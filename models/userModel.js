const { Schema, model } = require("mongoose");
const { hendleMongooseError } = require("../helpers");
const Joi = require("joi");

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const userSchema = new Schema(
  {
    name:{
        type: String,
        required: [true, "Name is required"],
    },
    password: {
        type: String,
        minLength: 8,
        required: [true, "Password is required"],
      },
      
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
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
  },
  { versionKey: false, timestamps: true }
);
userSchema.post("save", hendleMongooseError);


const userRegisterSchema = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "Missing required name field",
        "string.base": "name must be text",
      }),
  email: Joi.string().pattern(emailRegex).required().messages({
    "any.required": "Missing required email field",
    "string.base": "Email must be text",
    "string.pattern.base": "Entered email is not valid",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Missing required password field",
    "string.base": "Password must be text",
  }),
  subscription: Joi.string().valid("starter", "pro", "business"),
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
  password: Joi.string().min(6).required().messages({
    "any.required": "Missing required password field",
    "string.base": "Password must be text",
  }),
});

const userSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .required()
    .valid("starter", "pro", "business")
    .messages({
      "any.required": "Missing required field subscription",
      "string.base": "Unknown subscription type",
    }),
});

const schemas = {
  userRegisterSchema,
  userLoginSchema,
  userSubscriptionSchema,
  emailSchema,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};