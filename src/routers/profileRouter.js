import express from "express";
import { getProfile } from "../controllers/profileController.js";



export const profileRouter = express.Router();



profileRouter.get("/profile", getProfile)