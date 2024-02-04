const { Water } = require("../models/waterModel");

const monthInfoWaterList = async (owner, month) => {
  return Water.aggregate([
    { $match: { owner: owner, month: month } },
    {
      $group: {
        _id: {
          day: "$day",
        },
        total: { $sum: "$amount" },
        count: { $count: {} },
      },
    },
    {
      $addFields: {
        month: month,
        day: "$_id.day",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
};

module.exports = monthInfoWaterList;
