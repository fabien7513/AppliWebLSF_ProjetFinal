import express from "express";
import { getScheduleInterpreters } from "../controllers/scheduleInterpretersController.js";



export const scheduleInterpretersRouter = express.Router();



scheduleInterpretersRouter.get("/scheduleinterpreters", getScheduleInterpreters)