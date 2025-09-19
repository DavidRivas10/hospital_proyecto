import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { registerSchema, loginSchema, refreshSchema } from "../dto/auth.dto.js";

export const authRouter = Router();

authRouter.post("/auth/register", validateBody(registerSchema), authController.register);
authRouter.post("/auth/login", validateBody(loginSchema), authController.login);
authRouter.post("/auth/refresh", validateBody(refreshSchema), authController.refresh);
authRouter.post("/auth/logout", validateBody(refreshSchema), authController.logout);
