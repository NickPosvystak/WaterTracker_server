const { catchAsync, ctrlWrapper, HttpError } = require("../helpers");
const getDate = require("../helpers/getDate");
const getWaterInPercent = require("../helpers/getWaterInPercent");
const totalToday = require("../helpers/totalToday");
const { User } = require("../models/userModel");
const { Water } = require("../models/waterModel");

// WaterRate

const setWaterData = async (req, res) => {
  // take id form user
  const { _id: owner } = req.user;
  //set amount and time
  const { amount, time } = req.body;
  // get date
  const { day, month, year } = getDate(time);
  // create waterId
  const result = await Water.create({
    amount,
    time,
    day,
    month,
    year,
    owner,
  });

  res.status(201).json({
    _id: result._id,
    amount: result.amount,
    time: result.time,
  });
};

const deleteById = async (req, res) => {
  const { id } = req.params;
  const result = await Water.findByIdAndDelete(id);

  if (!result) {
    throw HttpError(400, "Missing or empty waterId parameter");
  }

  res.status(200).json({ "Removed waterId": result.id });
};

const updateById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Water.findByIdAndUpdate(id, req.body, { new: true });
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json({
      _id: result._id,
      amount: result.amount,
      time: result.time,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating water by ID" });
  }
};

const getWaterToday = async (req, res) => {
  try {
    const { _id: owner } = req.user;
    if (!owner) {
      throw HttpError(401, "Unauthorized: User not found");
    }

    const { dailyNorm } = await User.findById(owner);
    if (!dailyNorm) {
      throwHttpError(404, "User not found or missing dailyNorm");
    }

    const { day, month, year } = getDate(Date.now());
    const dailyList = await Water.find(
      { day, month, year, owner },
      "amount time"
    );

    // get total for today
    const total = await totalToday(dailyList);
    const percent = getWaterInPercent(total, dailyNorm);

    res.status(200).json({
      percent,
      dailyList,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
    }
  }
};

module.exports = {
  setWaterData: ctrlWrapper(setWaterData),
  deleteById: ctrlWrapper(deleteById),
  updateById: ctrlWrapper(updateById),
  getWaterToday: ctrlWrapper(getWaterToday),
};
