import { Router } from "express";
// 👇 IMPORTA el servicio donde realmente vive
import { QueueService } from "../../../domain/services/queue/queue.service.js";

export const queueRouter = Router();

// ⚠️ Asegúrate de tener una instancia única aquí (la que usan las rutas)
const queue = new QueueService();

/* ...tus rutas tal cual ya las tienes... */

// 👉 añade (o deja) estas endpoints tal como ya las tenías:
queueRouter.post("/triage", (req, res) => {
  const { patientId, sintomas, urgencia } = req.body ?? {};
  if (!patientId || !urgencia) return res.status(400).json({ error: "patientId y urgencia son requeridos" });
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

// Solo para tests
if (process.env.NODE_ENV === "test") {
  queueRouter.post("/__test__/reset", (_req, res) => {
    queue.reset();
    res.json({ ok: true });
  });
}

/* 👇👇 AÑADE ESTE EXPORT para que metrics.ts deje de fallar */
export const queueMetrics = {
  /** tamaño actual de la cola */
  get size() {
    return queue.size;
  },
  /** snapshot ordenado (p/ depuración o métricas) */
  snapshot() {
    return queue.snapshot();
  },
};
  