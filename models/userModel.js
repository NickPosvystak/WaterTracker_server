
const { Schema, model } = require("mongoose");
const Joi = require("joi");

const  {handleSaveError, preUpdate} =require("./hooks.js");

const { emailRegex } = require("../constant/constant");

const userSchema = new Schema({
  username: {
      type: String,
      required: true,
  },
  email: {
      type: String,
      match: emailRegex,
      unique: true,
      required: true,
  },
  password: {
      type: String,
      minLength: 8,
      maxLength:64,
      required: true,
  },
  token: {
      type: String,
  },
  verify: {
      type: Boolean,
      default: false,
  },
  verificationCode: {
      type: String,
  }
}, {versionKey: false, timestamps: true});

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", preUpdate);

userSchema.post("findOneAndUpdate", handleSaveError);

exports.userSignupSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
});

exports.userSigninSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
});

exports.userEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
});

const User = model("User", userSchema);

module.exports = {User}