const express = require("express");

const ctrl = require("../controllers/authController");

const {
  validateBody,
  authentificate,
  upload,
  passport,
  checkUpdateMyPassword,
} = require("../middlewares");

const { schemas } = require("../models/userModel");
const { userUpdateSchema } = require("../helpers");
// const {
//   updateEmailSchema,
//   updateNameSchema,
//   updatePasswordSchema,
// } = require("../helpers");

const authRouter = express.Router();

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  ctrl.googleAuth
);

authRouter.post(
  "/register",
  validateBody(schemas.userRegisterSchema),
  ctrl.register
);

authRouter.post(
  "/registerSeng",
  validateBody(schemas.userRegisterSchema),
  ctrl.registerSengrid
);

authRouter.get("/verify/:verificationToken", ctrl.verifyEmail);
// authRouter.post("/verify", ctrl.resendVerifyEmail);

authRouter.post(
  "/verify",
  validateBody(schemas.emailSchema),
  ctrl.resendVerifyEmail
);

authRouter.post("/login", validateBody(schemas.userLoginSchema), ctrl.login);

authRouter.post("/logout", authentificate, ctrl.logout);

authRouter.get("/current", authentificate, ctrl.getCurrent);

authRouter.patch(
  "/avatars",
  authentificate,
  upload.single("avatar"),
  ctrl.updateAvatar
);

authRouter.patch(
  "/updateWaterRate",
  authentificate,
  validateBody(schemas.updateWaterRate),
  ctrl.updateWaterRate
);

// authRouter.patch(
//   "/email",
//   authentificate,
//   validateBody(updateEmailSchema),
//   ctrl.updateEmail
// );

// authRouter.patch(
//   "/name",
//   authentificate,
//   validateBody(updateNameSchema),
//   ctrl.updateName
// );

// authRouter.patch(
//   "/password",
//   authentificate,
//   validateBody(updatePasswordSchema),
//   ctrl.updatePassword
// );

authRouter.patch(
  "/updateUser",
  authentificate,
  validateBody(userUpdateSchema),
  ctrl.updateUser
);

authRouter.patch(
  "/update-my-password",
  authentificate,
  checkUpdateMyPassword,
  ctrl.updateMyPassword
);

authRouter.post("/forgot-password", ctrl.forgotPassword);

authRouter.post("/restore-password/:verificationToken", ctrl.restorePassword);

module.exports = authRouter;
