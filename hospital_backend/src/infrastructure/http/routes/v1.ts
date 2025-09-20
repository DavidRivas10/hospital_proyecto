import { Router } from "express";
import { queueRoutes } from "./queue.routes.js";
import { authRoutes } from "./auth.routes.js";
import { docsRouter } from "./docs.routes.js";
import { historyRouter } from "./history.router.js";
import { patientRouter } from "./patient.routes.js";
import { reportsRouter } from "./reports.routes.js";

export const v1 = Router();

v1.use("/auth", authRoutes);
v1.use("/", queueRoutes);       // ← aquí quedan /triage, /queue, etc.
v1.use("/history", historyRouter);
v1.use("/patients", patientRouter);
v1.use("/reports", reportsRouter);
v1.use("/docs", docsRouter);
