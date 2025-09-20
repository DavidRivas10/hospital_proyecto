import { Router } from "express";
import { validateBody } from "../middlewares/validate.js";
import { patientController } from "../controllers/patient.controller.js";
import { patientCreateSchema, patientUpdateSchema } from "../dto/patient.dto.js";

export const patientRouter = Router();

// OJO: aquí van rutas RELATIVAS porque el v1.ts ya hace v1.use("/patients", patientRouter)
patientRouter.post("/", validateBody(patientCreateSchema), patientController.create);
patientRouter.get("/:id", patientController.getById);
patientRouter.get("/", patientController.searchByName);
patientRouter.patch("/:id", validateBody(patientUpdateSchema), patientController.update);
