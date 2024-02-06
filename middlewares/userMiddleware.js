const Joi = require("joi");
const { hashPassword } = require("../helpers");
const { User } = require("../models/userModel");
const { userUpdateSchema } = require("../helpers");


const updateUserPassword = async (req, res, next) => {
  try {
    const { email, name, gender, newPassword } = req.body;
    const validationResult = userUpdateSchema.validate({
      email,
      name,
      gender,
      newPassword,
    });

    if (validationResult.error) {
      return res
        .status(400)
        .json({ message: validationResult.error.details[0].message });
    }

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

module.exports = updateUserPassword;