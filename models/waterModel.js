const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../helpers");

const waterSchema = new Schema({
  amount: {
    type: Number,
    max: 15000,
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
});

//TODO: add JOI validation

const waterJoiValidation = Joi.object({
  amount: Joi.number().min(1).max(15000).required().message({
    any: `Amount is wrong`,
  }),
  date: Joi.date().required().message({
    any: `Time is wrong`,
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