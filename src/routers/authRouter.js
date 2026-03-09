import express from "express"
import { authguard } from "../services/authguard.js";
import {getLogin, getRegister, logout, postLogin, postRegister } from "../controllers/authController.js";


export const authRouter = express.Router();

authRouter.get("/register", getRegister)
authRouter.post("/register", postRegister)

authRouter.get("/login", getLogin)
authRouter.post("/login", postLogin)

authRouter.get("/logout", logout)