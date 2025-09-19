// src/infrastructure/http/routes/docs.routes.ts
import { Router } from "express";
// @ts-expect-error CJS import
import swaggerUi from "swagger-ui-express";
import { openapi } from "../schema/openapi.js";

export const docsRouter = Router();

docsRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));
