import express from "express";
import { getRequestPage, postRequestPage } from "../controllers/requestController.js";

export const requestRouter = express.Router();

requestRouter.get("/request/:id", getRequestPage);
requestRouter.post("/request/:id", postRequestPage);
