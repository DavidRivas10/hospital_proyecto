import { Router } from "express";
import { reportsController } from "../controllers/reports.controller.js";

export const reportsRouter = Router();

reportsRouter.get("/reports/summary", reportsController.summary);
