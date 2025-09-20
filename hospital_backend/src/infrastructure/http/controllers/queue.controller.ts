// src/infrastructure/http/controllers/queue.controller.ts
import { Router } from "express";
import { QueueService } from "../../../domain/services/queue/queue.service.js";

export const queueRouter = Router();
const queue = new QueueService();

/* Rutas existentes */
queueRouter.post("/triage", (req, res) => {
  const { patientId, sintomas, urgencia } = req.body ?? {};
  if (!patientId || !urgencia)
    return res.status(400).json({ error: "patientId y urgencia son requeridos" });
  const t = queue.enqueue({ patientId, sintomas, urgencia: Number(urgencia) });
  return res.status(201).json({ ticket: t });
});

queueRouter.get("/queue", (_req, res) => {
  const items = queue.snapshot();
  res.json({ size: items.length, items });
});

queueRouter.post("/queue/next", (_req, res) => {
  const t = queue.next();
  if (!t) return res.sendStatus(204);
  res.json({ ticket: t });
});

queueRouter.patch("/queue/:id/urgency", (req, res) => {
  const { id } = req.params;
  const { urgencia } = req.body ?? {};
  const ok = queue.reprioritize(id, Number(urgencia));
  if (!ok) return res.sendStatus(404);
  res.json({ ok: true });
});

/* marcar ticket como atendido */
queueRouter.post("/queue/:id/attend", (req, res) => {
  const { id } = req.params;
  const rec = queue.attend(id);
  if (!rec) return res.sendStatus(404);
  res.json({ attended: rec });
});

/* métricas */
queueRouter.get("/queue/metrics", (_req, res) => {
  res.json(queue.metricsToday());
});

/* ⬇️ historial (creados + atendidos) */
queueRouter.get("/history", (req, res) => {
  const limit = Number(req.query.limit ?? 500) || 500;
  res.json({ items: queue.history(limit) });
});

// Solo para tests
if (process.env.NODE_ENV === "test") {
  queueRouter.post("/__test__/reset", (_req, res) => {
    queue.reset();
    res.json({ ok: true });
  });
}

/* Export opcional */
export const queueMetrics = {
  get size() {
    return queue.size;
  },
  snapshot() {
    return queue.snapshot();
  },
  metricsToday() {
    return queue.metricsToday();
  },
};
