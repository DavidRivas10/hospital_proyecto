import { Router } from "express";
import { queueRouter } from "./queue.routes.js";
import { patientRouter } from "./patient.routes.js";
import { reportsRouter } from "./reports.routes.js";
import { authRouter } from "./auth.routes.js";
import { docsRouter } from "./docs.routes.js";

export const router = Router();

router.get("/", (_req, res) => res.json({ api: "v1", ok: true }));

router.use("/", authRouter);    // 👈 añade esto
router.use("/", queueRouter);
router.use("/", patientRouter);
router.use("/", reportsRouter);
router.use("/", docsRouter);
