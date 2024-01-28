const express = require("express");

const ctrl = require("../controllers/authController");

const { validateBody, authentificate, upload } = require("../middlewares");

const { schemas } = require("../models/userModel");

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateBody(schemas.userRegisterSchema),
  ctrl.register
);

authRouter.get("/verify/:verificationToken", ctrl.verifyEmail);
// authRouter.post("/verify", ctrl.resendVerifyEmail);

authRouter.post(
  "/verify",
  validateBody(schemas.emailSchema),
  ctrl.resendVerifyEmail
);

authRouter.post("/login", validateBody(schemas.userRegisterSchema), ctrl.login);

authRouter.get("/current", authentificate, ctrl.getCurrent);

authRouter.post("/logout", authentificate, ctrl.logout);


module.exports = authRouter;