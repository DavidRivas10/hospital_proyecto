import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { router as v1 } from "./routes/v1.js";
import { registry } from "../monitoring/metrics.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

// Límite básico: 100 req/15min por IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/v1", v1);

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", registry.contentType);
  res.send(await registry.metrics());
});

export default app;
