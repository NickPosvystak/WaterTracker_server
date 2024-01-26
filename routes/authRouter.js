const express = require("express");
const authControllers = require("../controllers/authController"); 

const { authenticate, isEmptyBody } = require("../middlewares/index.js");
const { userSignupSchema, userSigninSchema, userEmailSchema } = require("../models/userModel.js");

const authRouter = express.Router();

authRouter.post("/register", isEmptyBody, userSignupSchema, authControllers.register);
authRouter.get("/verify/:verificationCode", authControllers.verify); 
authRouter.post("/verify", isEmptyBody, userEmailSchema, authControllers.resendVerify);
authRouter.post("/login", isEmptyBody, userSigninSchema, authControllers.login);
authRouter.get("/current", authenticate, authControllers.getCurrent);
authRouter.post("/logout", authenticate, authControllers.logout);

module.exports = authRouter;
