const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../helpers");

const waterSchema = new Schema(
  {
    amount: {
      type: Number,
      max: 5000,
      required: [true, "Amount is required"],
    },
    time: {
      type: Date,
      required: [true, "Time is required"],
    },
    day: {
      type: Number,
      default: null,
    },
    month: {
      type: Number,
      default: null,
    },
    year: {
      type: Number,
      default: null,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    },
  { versionKey: false, timestamps: true }
);

//TODO: add JOI validation

const waterJoiValidation = Joi.object({
  amount: Joi.number().min(1).max(5000).required().messages({
    "any.required": "Amount is required",
    "number.base": "Amount must be a number",
    "number.min": "Amount must be at least 1",
    "number.max": "Amount must be at most 5000",
  }),
  time: Joi.date().required().messages({
    "any.required": "Time is required",
    "time.base": "Invalid time format",
  }),

});

waterSchema.post("save", handleMongooseError);

const Water = model("Water", waterSchema);
const schemas = {
  waterJoiValidation,
};

module.exports = {
  Water,
  schemas,
};
// ,
