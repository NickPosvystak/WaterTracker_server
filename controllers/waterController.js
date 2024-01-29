const { catchAsync, ctrlWrapper,HttpError } = require("../helpers");
const getDate  = require("../helpers/getDate");
const { User } = require("../models/userModel");
const { Water } = require("../models/waterModel");

// WaterRate

const setWaterRate = async (req, res) => {
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
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating water by ID:", error);
    res.status(500).json({ error: "Error updating water by ID" });
  }
};




module.exports = {
  setWaterRate:ctrlWrapper(setWaterRate),
  deleteById:ctrlWrapper(deleteById),
  updateById:ctrlWrapper(updateById)
};

