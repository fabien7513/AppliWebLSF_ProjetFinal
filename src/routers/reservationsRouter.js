import express from "express";
import { getReservation } from "../controllers/reservationController.js";
import { authguard } from "../services/authguard.js";




export const reservationsRouter = express.Router();



reservationsRouter.get("/reservations", authguard, getReservation)
