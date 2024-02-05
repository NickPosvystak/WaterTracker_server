const Joi = require("joi");
const { hashPassword } = require("../helpers");
const { User } = require("../models/userModel");
const { userUpdateSchema } = require("../helpers");

const updateUserPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, email, name, gender } = req.body;
    const { _id } = req.user;
    

    const validationResult = userUpdateSchema.validate({
      email,
      name,
      newPassword: newPassword,
      gender,
    });

    if (validationResult.error) {
      return res
        .status(400)
        .json({ message: validationResult.error.details[0].message });
    }

    const user = await User.findById(_id);

    // Check current password only if newPassword is provided
    if (newPassword || email || name || gender) {
      const isMatch = await user.checkPassword(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
    }

    // Create an empty object to store the fields that need to be updated
    const updateFields = {};

    // Check if the fields are provided and update the object accordingly
    if (email) {
      updateFields.email = email;
    }
    if (name) {
      updateFields.name = name;
    }
    if (gender) {
      updateFields.gender = gender;
    }

    let hashedPassword;
    if (newPassword) {
      hashedPassword = await hashPassword(newPassword);
      updateFields.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(_id, updateFields, {
      new: true,
    });

    const response = {
      message: "User updated successfully",
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        gender: updatedUser.gender,
        dailyNorm: user.dailyNorm,
        avatarUrl: user.avatarURL,
        created: user.createdAt,
        updated: updatedUser.updatedAt,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

module.exports = updateUserPassword;
