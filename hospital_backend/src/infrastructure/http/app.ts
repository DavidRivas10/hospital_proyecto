// src/infrastructure/http/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { v1 } from "./routes/v1.js";

const app = express();

// --- CORS (antes de las rutas) ---
const allowedOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true, // no molesta si no usas cookies
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Responder preflight OPTIONS explícitamente
app.options(
  "*",
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- middlewares base ---
app.use(morgan("dev"));
app.use(express.json());

// --- rutas ---
app.use("/v1", v1);

export default app;
