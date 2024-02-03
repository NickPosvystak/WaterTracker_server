const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");
const Joi = require("joi");
const { gender, emailRegex } = require("../constant/constant");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new Schema(
  {
    name: {
      type: String,
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
      // required: [true, "Verify token is required"],
    },
    gender: {
      type: String,
      enum: [...Object.values(gender)],
      default: null,
    },
    dailyNorm: {
      type: Number,
      default: null,
    },
    avatarURL: {
      type: String,
      required: true,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExp: {
      type: Date,
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

  password: Joi.string().min(8).required().messages({
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

const updateWaterRate = Joi.object({
  dailyNorm: Joi.number().min(1).max(15000).required().messages({
    "number.base": `DailyNorm should a number between 1 - 15000`,
    "number.min": `DailyNorm can't be less than 1`,
    "number.max": `DailyNorm can't be more than 15000`,
  }),
});

userSchema.methods.checkPassword = async function (
  candidatePassword,
  hashedPassword
) {
  if (!candidatePassword || !hashedPassword) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, hashedPassword);
};



userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExp = Date.now() + 10 * 60 * 1000; // Установите срок действия токена здесь

  return resetToken;
};

const schemas = {
  userRegisterSchema,
  userLoginSchema,
  emailSchema,
  updateWaterRate,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
