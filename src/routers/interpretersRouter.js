import express from "express";
import { getListInterpreters } from "../controllers/interpretersController.js";


export const interpretersRouter = express.Router();




interpretersRouter.get("/interpreters", getListInterpreters)



