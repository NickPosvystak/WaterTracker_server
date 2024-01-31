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
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ message: "Water deleted" });
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
    const { dailyNorm } = await User.findById(owner);
    console.log("dailyNorm:=========> ", dailyNorm);

    const { day, month, year } = getDate(Date.now());
    const dailyList = await Water.find(
      { day, month, year, owner },
      "amount time"
    );
    console.log("dailyList: ", dailyList);

    // get total for today
    const total = await totalToday(dailyList);
    console.log("total: =============>", total);
    const percent = getWaterInPercent(total, dailyNorm);
    console.log("percent: ============>", percent);

    res.status(201).json({
      percent,
      dailyList,
    });
  } catch (error) {
    res.status(400).json({ message: `Bad request` });
  }
};

module.exports = {
  setWaterData: ctrlWrapper(setWaterData),
  deleteById: ctrlWrapper(deleteById),
  updateById: ctrlWrapper(updateById),
  getWaterToday: ctrlWrapper(getWaterToday),
};
