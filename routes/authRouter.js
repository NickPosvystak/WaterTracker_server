import express from "express";

import {authController} from "../controllers/index.js";

import {authenticate, isEmptyBody} from "../middlewares/index.js";

import {validateBody} from "../decorators/index.js";

import { userSignupSchema, userSigninSchema, userEmailSchema } from "../models/userModel.js";

const authRouter = express.Router();

authRouter.post("/register", isEmptyBody, validateBody(userSignupSchema), authController.signup);

authRouter.get("/verify/:verificationCode", authController.verify);

authRouter.post("/verify", isEmptyBody, validateBody(userEmailSchema), authController.resendVerify);

authRouter.post("/login", isEmptyBody, validateBody(userSigninSchema), authController.signin);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.signout);

export {authRouter};
