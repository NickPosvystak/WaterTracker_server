const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");
const gravatar = require("gravatar");

const { User } = require("../models/userModel");

const { HttpError, ctrlWrapper, sendEmailSengrid } = require("../helpers");
const Email = require("../helpers/sendEmail");

const { JWT_SECRET, BASE_URL, FRONTEND_URL } = process.env;
const jwtExpires = "1d";

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email, { default: "wavatar" });
  const verificationToken = uuidv4();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    verificationToken,
    avatarURL,
  });

  await newUser.save();

  // Send email notification
  const verifyLink = `${BASE_URL}/api/user/verify/${verificationToken}`;
  await new Email(newUser, verifyLink).sendVerification();

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

  res.status(200).json({
    message: "Verification successful",
  });
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
  //TODO: removed specifically for testing
  // if (!user.verify) {
  //   throw HttpError(401, "Email not verified");
  // }

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
    avatar: user.avatarURL,
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
    avatar: user.avatarURL,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json({
    message: "No Content",
  });
};

// const updateAvatar = async (req, res) => {
//   const { _id } = req.user;
//   const { path: tempUpload, originalname } = req.file;
//   const filename = `${_id}_${originalname}`;
//   const resultUpload = path.join(avatarsDir, filename);

//   try {
//     const image = await Jimp.read(tempUpload);
//     await image.resize(250, 250).write(resultUpload);
//   } catch (error) {
//     console.error("Error processing avatar:", error);
//     throw HttpError(500, "Internal Server Error");
//   }

//   await fs.rename(tempUpload, resultUpload);
//   const avatarURL = path.join("avatars", filename);
//   await User.findByIdAndUpdate(_id, { avatarURL });

//   res.json({
//     avatarURL,
//   });
// };

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const avatarURL = req.file.path;
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

// const updateEmail = async (req, res) => {
//   const { email } = req.body;
//   const { _id } = req.user;
//   const user = await User.findByIdAndUpdate(_id, { email });
//   if (!user) {
//     throw HttpError(404, "User not found");
//   }

//   res.status(200).json({
//     message: "Email updated successfully",
//     user: {
//       email: user.email,
//     },
//   });
// };

// const updateName = async (req, res) => {
//   const { name } = req.body;
//   const { _id } = req.user;
//   const user = await User.findByIdAndUpdate(_id, { name }, { new: true });

//   if (!user) {
//     throw HttpError(404, "User not found");
//   }

//   res.status(200).json({
//     message: "Name updated successfully",
//     user: {
//       name: user.name,
//     },
//   });
// };

// const updatePassword = async (req, res) => {
//   const { password } = req.body;
//   const { _id } = req.user;
//   const hashPassword = await bcrypt.hash(password, 10);
//   const user = await User.findByIdAndUpdate(
//     _id,
//     { password: hashPassword },
//     { new: true }
//   );

//   if (!user) {
//     throw HttpError(404, "User not found");
//   }

//   res.status(200).json({
//     message: "Password updated successfully",
//     user: {
//       password: password,
//     },
//   });
// };

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
      password: newPassword,
      gender: updatedUser.gender,
    },
  };

  res.status(200).json(response);
};

const registerSengrid = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = uuidv4();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  await newUser.save();

  const verifyLink = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/user/verify/${verificationToken}">Click verify email</a>`,
  };

  await sendEmailSengrid(verifyLink);

  res.status(201).json({
    user: {
      email: newUser.email,
    },
  });
};

const updateWaterRate = async (req, res) => {
  const { _id } = req.user;

  const newUser = await User.findByIdAndUpdate(_id, req.body, { new: true });

  res.status(200).json({ dailyNorm: newUser.dailyNorm });
};

const googleAuth = async (req, res) => {
  const { _id: id, avatarURL, verificationToken } = req.user;

  if (!avatarURL) {
    return res.status(400).json({ message: "Отсутствует URL аватара." });
  }

  if (!verificationToken) {
    return res
      .status(400)
      .json({ message: "Отсутствует токен подтверждения." });
  }

  const payload = {
    id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: jwtExpires });

  await User.findByIdAndUpdate(id, {
    token,
    avatarURL,
    verificationToken,
    email,
  });

  res.redirect(`${FRONTEND_URL}?token=${token}`);
};

module.exports = {
  register: ctrlWrapper(register),
  registerSengrid: ctrlWrapper(registerSengrid),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
  // updateEmail: ctrlWrapper(updateEmail),
  // updateName: ctrlWrapper(updateName),
  // updatePassword: ctrlWrapper(updatePassword),
  updateUser: ctrlWrapper(updateUser),
  updateWaterRate: ctrlWrapper(updateWaterRate),
  googleAuth: ctrlWrapper(googleAuth),
};
