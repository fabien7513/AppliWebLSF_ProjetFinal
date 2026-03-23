import express from "express";
import {
  getScheduleInterpreters,
  postScheduleInterpreters,
  deleteScheduleInterpreters,
  putScheduleInterpreters
} from "../controllers/scheduleInterpretersController.js";

export const scheduleInterpretersRouter = express.Router();

scheduleInterpretersRouter.get("/scheduleinterpreters", getScheduleInterpreters);
scheduleInterpretersRouter.post("/scheduleinterpreters", postScheduleInterpreters);
scheduleInterpretersRouter.put("/scheduleinterpreters/:id", putScheduleInterpreters);
scheduleInterpretersRouter.delete("/scheduleinterpreters/:id", deleteScheduleInterpreters);