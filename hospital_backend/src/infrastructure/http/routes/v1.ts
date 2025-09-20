import { Router } from "express";

// IMPORTA CON .js (ESM / NodeNext)
import { authRouter } from "./auth.routes.js";
import { queueRouter } from "./queue.routes.js";
import { patientRouter } from "./patient.routes.js";
import { reportsRouter } from "./reports.routes.js";
import { historyRouter } from "./history.router.js";
import { testRouter } from "./__test__.router.js";

export const router = Router();

/**
 * Montamos TODOS los routers en la raíz de /v1,
 * para respetar los paths internos de cada router.
 *
 * - Si authRouter define "/auth/login", quedará /v1/auth/login
 * - Si queueRouter define "/triage" y "/queue/next", quedará /v1/triage y /v1/queue/next
 * - Si patients define "/patients", quedará /v1/patients
 * - etc.
 */
router.use("/", authRouter);
router.use("/", queueRouter);
router.use("/", patientRouter);
router.use("/", reportsRouter);
router.use("/", historyRouter);

// utilidades de test SIEMPRE disponibles para Vitest
router.use("/__test__", testRouter);
