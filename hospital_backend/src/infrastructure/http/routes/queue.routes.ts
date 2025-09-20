// src/infrastructure/http/routes/queue.routes.ts
import { Router } from "express";
import { queueRouter } from "../controllers/queue.controller.js";

// Este archivo SOLO monta el router ya definido en el controller.
export const queueRoutes = Router();
queueRoutes.use("/", queueRouter);
