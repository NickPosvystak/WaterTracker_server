const catchAsync = require("../helpers/catchAsync");
const { User } = require("../models/userModel");

exports.createUser = catchAsync(async (req, res, next) => {

  const newUser = await User.create(req.body);
  await newUser.save();
  console.log('newUser: ', newUser);

 res.status(201).json({
   msg: "Success!",
   user: newUser,
 });

});
