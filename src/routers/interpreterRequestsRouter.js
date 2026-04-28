import express from "express";
import { authguard } from "../services/authguard.js";
import {
  acceptInterpreterRequest,
  getInterpreterRequests,
  refuseInterpreterRequest
} from "../controllers/interpreterRequestsController.js";

export const interpreterRequestsRouter = express.Router();

interpreterRequestsRouter.get("/interpreter/requests", authguard, getInterpreterRequests);
interpreterRequestsRouter.post("/interpreter/requests/:id/accept", authguard, acceptInterpreterRequest);
interpreterRequestsRouter.post("/interpreter/requests/:id/refuse", authguard, refuseInterpreterRequest);
