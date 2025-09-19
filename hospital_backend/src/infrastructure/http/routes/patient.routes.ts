import { Router } from "express";
import { validateBody } from "../middlewares/validate.js";
import { patientController } from "../controllers/patient.controller.js";
import { patientCreateSchema, patientUpdateSchema } from "../dto/patient.dto.js";

export const patientRouter = Router();

patientRouter.post("/patients", validateBody(patientCreateSchema), patientController.create);
patientRouter.get("/patients/:id", patientController.getById);
patientRouter.get("/patients", patientController.searchByName);
patientRouter.patch("/patients/:id", validateBody(patientUpdateSchema), patientController.update);
