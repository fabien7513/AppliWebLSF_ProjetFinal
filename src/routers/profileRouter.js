import express from "express";
import { getProfile, postProfile } from "../controllers/profileController.js";
import { authguard } from "../services/authguard.js";
import { upload } from "../middlewares/upload.js";


export const profileRouter = express.Router();



profileRouter.get("/profile", authguard, getProfile)
profileRouter.post("/profile", authguard, upload.single("photo"), postProfile)



