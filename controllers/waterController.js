const { catchAsync, ctrlWrapper, HttpError } = require("../helpers");
const getDate = require("../helpers/getDate");
const monthInfoWaterList = require("../helpers/getWaterListInfo");
const getWaterInPercent = require("../helpers/getWaterInPercent");
const totalToday = require("../helpers/totalToday");
const { User } = require("../models/userModel");
const { Water } = require("../models/waterModel");
const numDays = require("../helpers/getAllDaysOfMonth");

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
      throw HttpError(404, "User not found or missing dailyNorm");
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


//getWaterInfoByMonth

// const  getDaysInMonth=(year, month) =>{
//   return new Date(year, month + 1, 0).getDate();
// }

// const getWaterInfoByMonth = async (req, res) => {
//   try {
//       const { _id: owner } = req.user;
//       if (!owner) {
//         throw HttpError(401, "Unauthorized: User not found");
//       }

//       const { month, year } = req.body;

//       const firstDayOfMonth = new Date(`${year}-${month}-01`);
//       const lastDayOfMonth = new Date(new Date(firstDayOfMonth).setMonth(firstDayOfMonth.getMonth() + 1) - 1);

//       const { dailyNorm } = await User.findById(owner);
//       if (!dailyNorm) {
//         throw HttpError(404, "User not found or missing dailyNorm");
//       }

//       const dailyList = await Water.find(
//           { day: { $gte: firstDayOfMonth.getDate(), $lte: lastDayOfMonth.getDate() }, month, year, owner },
//           "day month amount time"
//       );

//       const totalDaysInMonth = getDaysInMonth(year, month);
//       const waterInfoByDay = [];

//       for (let day = 1; day <= totalDaysInMonth; day++) {
//           const dateFormatted = `${day}, ${getMonthName(month)}`;
//           const existingData = dailyList.find(item => item.day === day);

//           if (existingData) {
//               const countConsumers = dailyList.filter(item => item.day === day).length;
//               const percentage = getWaterInPercent(existingData.amount, dailyNorm);
//               waterInfoByDay.push({ id: day, date: dateFormatted, waterNorma: dailyNorm, percentage, consumers: countConsumers });
//           } else {
//               waterInfoByDay.push({ id: day, date: dateFormatted, waterNorma: " ", percentage: " ", consumers: 0 });
//           }
//       }

//       res.status(200).json({
//           waterInfoByDay,
//           totalDays: totalDaysInMonth,
//       });
//   } catch (error) {
//       if (error instanceof HttpError) {
//           res.status(error.statusCode).json({ message: error.message });
//       } else {
//           res.status(500).json({ message: "Server error" });
//       }
//   }
// };

// const getMonthName = (monthNumber) => {
//   const months = [    
// "January", "February", "March", "April", "May", "June", "July",
// "August", "September", "October", "November", "December"
//   ];
//   return months[monthNumber - 1];
// };


const getWaterPerMonth = async (req, res) => {
  try {
    const { date } = req.query;
    const { _id: owner } = req.user;
    const { dailyNorm } = await User.findById(owner);

    if (!dailyNorm) {
      throw HttpError(404, "User not found or missing dailyNorma");
    }

    const list = await getMonthList(date, dailyNorm, owner);

    res.status(200).json(list);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getMonthList = async (date, norma, owner) => {
  const list = [];

  const { month, year } = getDate(date);
  const currentYear = new Date().getFullYear();

  if (!month || !year || !(currentYear - 3 < year && year < currentYear + 3)) {
    throw HttpError(404, `Date is not correct`);
  }

  const listResult = await monthInfoWaterList(owner, month, norma);
  const daysInMonth = numDays(year, month);

  for (let index = 1; index <= daysInMonth; index++) {
    const currentDay = listResult.filter((el) => el.day === index);
    const percent = getWaterInPercent(currentDay[0]?.total, norma);

    list.push({
      date: { day: index, month },
      dailyNorm: norma,
      percent: percent,
      quantity: currentDay[0]?.count || null,
    });
  }

  return list;
};




module.exports = {
  // getWaterInfoByMonth: ctrlWrapper(getWaterInfoByMonth),
  setWaterData: ctrlWrapper(setWaterData),
  deleteById: ctrlWrapper(deleteById),
  updateById: ctrlWrapper(updateById),
  getWaterToday: ctrlWrapper(getWaterToday),
  getWaterPerMonth: ctrlWrapper(getWaterPerMonth),
};
