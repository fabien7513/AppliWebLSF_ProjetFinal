import express from "express";
import { getReservation } from "../controllers/reservationController.js";




export const reservationsRouter = express.Router();



reservationsRouter.get("/reservations", getReservation)

