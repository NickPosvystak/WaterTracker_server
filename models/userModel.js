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

//TODO:  add Joi validation

const User = model("User", userSchema);

module.exports = {User}