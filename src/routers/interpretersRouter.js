import express from "express";
import { getListInterpreters, searchInterpreters } from "../controllers/interpretersController.js";


export const interpretersRouter = express.Router();




interpretersRouter.get("/interpreters", getListInterpreters)
interpretersRouter.get("/interpreters/search", searchInterpreters)



