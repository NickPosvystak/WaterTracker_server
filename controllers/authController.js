const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");
const gravatar = require("gravatar");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const { User } = require("../models/userModel");

const {
  HttpError,
  ctrlWrapper,
  sendEmailSengrid,
  hashPassword,
} = require("../helpers");
const Email = require("../helpers/sendEmail");

const { JWT_SECRET, BASE_URL, FRONTEND_URL, FORGOT_URL } = process.env;
const jwtExpires = "1d";

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const registerSendGrid = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  // const avatarURL = gravatar.url(email);
  const avatarURL = gravatar.url(email, { default: "wavatar" });
  const verificationToken = uuidv4();

  const newUser = await User.findOneAndUpdate(
    { email },
    {
      ...req.body,
      password: hashPassword,
      verificationToken,
      avatarURL,
    },
    { new: true, upsert: true }
  );

  const verifyLink = {
    to: email,
    subject: "Verification mail",
    template: "verification",
    url: `${BASE_URL}/api/user/verify/${verificationToken}`,
  };

  await sendEmailSengrid(verifyLink);

  res.status(201).json({
    user: {
      email: newUser.email,
    },
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }
  
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.redirect("https://imiryna.github.io/WaterTracker/signin");
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  // Resend email verification link
  const resendLink = `${BASE_URL}/api/user/verify/${user.verificationToken}`;
  await new Email(user, resendLink).sendVerification();

  res.status(200).json({
    message: "Verification email sent",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, "Email or password is wrong");
  }
    if (!user.verify) {
      throw HttpError(400, "Email verification is required");
    }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(404, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: jwtExpires });

  await User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    token: token,
    name: user.name,
    email: user.email,
    gender: user.gender,
    dailyNorm: user.dailyNorm,
    avatarUrl: user.avatarURL,
    created: user.createdAt,
    updated: user.updatedAt,
  });
};

const getCurrent = async (req, res) => {
  const { user } = req;
  if (!user) {
    throw new HttpError(401, "User not authenticated");
  }

  res.status(200).json({
    name: user.name,
    email: user.email,
    token: user.token,
    gender: user.gender,
    dailyNorm: user.dailyNorm,
    avatarUrl: user.avatarURL,
    created: user.createdAt,
    updated: user.updatedAt,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json({
    message: "No Content",
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const avatarURL = req.file.path;
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

const updateUser = async (req, res) => {
  const { email, name, password, gender } = req.body;
  const { _id } = req.user;

  let updatedFields = { email, name };

  let newPassword;
  if (password) {
    newPassword = password;
    const hashPassword = await bcrypt.hash(password, 10);
    updatedFields.password = hashPassword;
  }

  if (gender) {
    updatedFields.gender = gender;
  }

  const updatedUser = await User.findByIdAndUpdate(_id, updatedFields, {
    new: true,
  });

  if (!updatedUser) {
    throw HttpError(404, "User not found");
  }

  const response = {
    message: "User updated successfully",
    user: {
      email: updatedUser.email,
      name: updatedUser.name,
      // password: newPassword,
      gender: updatedUser.gender,
    },
  };

  res.status(200).json(response);
};

const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, email, name, gender } = req.body;
    const { _id, email: userEmail, password } = req.user;

    // Перевірка, чи є новий пароль надісланим, якщо так, перевіряємо чи він співпадає з поточним паролем
    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
    }

    const updateFields = {};

    if (email && email !== userEmail) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== _id) {
        return res.status(400).json({ message: "Email is already in use" });
      }
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
      hashedPassword = await bcrypt.hash(newPassword, 10);
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
        dailyNorm: updatedUser.dailyNorm,
        avatarUrl: updatedUser.avatarURL,
        created: updatedUser.createdAt,
        updated: updatedUser.updatedAt,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw HttpError(400, "Email is required");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ msg: "Password reset instruction sent by email" });
    }

    const verificationToken = uuidv4();
    user.verificationToken = verificationToken;
    await user.save();

    console.log(verificationToken);

    const tempPasswordResetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = tempPasswordResetToken;
    user.passwordResetTokenExp = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:3000/WaterTracker/updatepassword?token=${verificationToken}`;

    const emailData = {
      to: user.email,
      subject: "Password Reset Instruction",
      template: "reset",
      url: `${resetUrl}`,
    };

    await sendEmailSengrid(emailData);

    res.status(200).json({
      msg: "Password reset instruction sent by email",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw HttpError(500, "Internal Server Error");
  }
};

const restorePassword = async (req, res) => {
  try {
    const { verificationToken } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ verificationToken });

    if (!user || !user.passwordResetToken) {
      throw HttpError(400, "Token is not valid");
    }

    if (Date.now() > user.passwordResetTokenExp) {
      throw HttpError(400, "Token has expired");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.verificationToken = null;
    user.passwordResetToken = null;
    user.passwordResetTokenExp = null;

    await user.save();

    res.status(200).json({
      msg: "Success",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};


const updateWaterRate = async (req, res) => {
  const { _id } = req.user;

  const newUser = await User.findByIdAndUpdate(_id, req.body, { new: true });

  res.status(200).json({ dailyNorm: newUser.dailyNorm });
};

const googleAuth = async (req, res) => {
  const { _id: id } = req.user;

  const payload = {
    id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: jwtExpires });
  await User.findByIdAndUpdate(id, { token });

  res.redirect(`${FRONTEND_URL}?Token=${token}`);
};

module.exports = {
  register: ctrlWrapper(register),
  registerSendGrid: ctrlWrapper(registerSendGrid),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
  updateMyPassword: ctrlWrapper(updateMyPassword),
  updateUser: ctrlWrapper(updateUser),
  updateWaterRate: ctrlWrapper(updateWaterRate),
  googleAuth: ctrlWrapper(googleAuth),
  forgotPassword: ctrlWrapper(forgotPassword),
  restorePassword: ctrlWrapper(restorePassword),
};
