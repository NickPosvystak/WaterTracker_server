const Joi = require("joi");
const { hashPassword } = require("../helpers");
const { User } = require("../models/userModel");
const { userUpdateSchema } = require("../helpers");

const updateUserPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, email, name, gender } = req.body;
    const { _id } = req.user;
    const user = await User.findById(_id);

    const isMatch = await user.checkPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const validationResult = userUpdateSchema.validate({
      email,
      name,
      password: newPassword,
      gender,
    });
    if (validationResult.error) {
      return res
        .status(400)
        .json({ message: validationResult.error.details[0].message });
    }

    let hashedPassword;
    if (newPassword) {
      hashedPassword = await hashPassword(newPassword);
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { email, name, password: hashedPassword, gender },
      { new: true }
    );

    const response = {
      message: "User updated successfully",
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        gender: updatedUser.gender,
        password: newPassword ? newPassword : "Password was not updated",
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

module.exports = updateUserPassword;
