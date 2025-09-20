import { Router } from "express";
import { loginHandler, protectedHandler, registerHandler, refreshHandler, logoutHandler } from "../controllers/auth.controller.js";

export const authRoutes = Router();
authRoutes.post("/login", loginHandler);
authRoutes.get("/protected-complete", protectedHandler);
authRoutes.post("/register", registerHandler);
authRoutes.post("/refresh", refreshHandler);
authRoutes.post("/logout", logoutHandler);
