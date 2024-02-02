const checkUserPasswords = async (id, currentPassword, newPassword) => {
  const currUser = await User.findById(id).select("+password");

  if (!(await currUser.checkPassword(currentPassword, currUser.password))) {
    throw new HttpError(401, "Current password invalid!");
  }

  currUser.password = newPassword;

  await currUser.save();
};

const getUserByEmail = (email) => User.findOne({ email });

module.exports = { checkUserPasswords, getUserByEmail };
