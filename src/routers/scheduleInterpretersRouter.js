import express from "express";
import { authguard } from "../services/authguard.js";
import {
  getScheduleInterpreters,
  postScheduleInterpreters,
  deleteScheduleInterpreters,
  putScheduleInterpreters
} from "../controllers/scheduleInterpretersController.js";

export const scheduleInterpretersRouter = express.Router();

scheduleInterpretersRouter.get("/scheduleinterpreters", getScheduleInterpreters);
scheduleInterpretersRouter.post("/scheduleinterpreters", authguard, postScheduleInterpreters);
scheduleInterpretersRouter.put("/scheduleinterpreters/:id", authguard, putScheduleInterpreters);
scheduleInterpretersRouter.delete("/scheduleinterpreters/:id", authguard, deleteScheduleInterpreters);
