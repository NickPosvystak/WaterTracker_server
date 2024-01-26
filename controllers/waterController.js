const { catchAsync } = require("../helpers");
const getDate  = require("../helpers/getDate");
const { User } = require("../models/userModel");
const { Water } = require("../models/waterModel");

// WaterRate

const setWaterRate = async (req, res) => {
  try {
// 
    
    // const {_id: owner } = req.user;
    // console.log('req.user: ', req.user);
    const { amount, time} = req.body;
    console.log("req.body:====> ", req.body);

    const { day, month, year } = getDate(time);

    const result = await Water.create({
      amount,
      time,
      day,
      month,
      year,
      owner,
    });
    console.log("result: ======>", result);

    res.status(201).json({
      _id: result._id,
      amount: result.amount,
      time: result.time,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  setWaterRate,
};

