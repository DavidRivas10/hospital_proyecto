import { Router } from "express";
import { QueueService } from "../../../domain/services/queue/queue.service.js";
import { HistoryModel } from "../../persistence/mongoose/models/history.model.js";
import { wsEmit } from "../../ws/socket.js";

export const queueRouter = Router();
const queue = new QueueService();

/* Crear ticket (TRIAGE) */
queueRouter.post("/triage", async (req, res, next) => {
  try {
    const { patientId, sintomas, urgencia } = req.body ?? {};
    if (!patientId || !urgencia)
      return res.status(400).json({ error: "patientId y urgencia son requeridos" });

    const t = queue.enqueue({ patientId, sintomas, urgencia: Number(urgencia) });

    // persistir evento visible en historial
    await HistoryModel.create({
      type: "TRIAGE_CREATED",
      at: new Date(t.enqueuedAt),
      ticket: {
        id: t.id,
        patientId: t.patientId,
        urgencia: t.urgencia,
        arrivalSeq: t.arrivalSeq,
      },
      hidden: false,
    });

    // notificar feed (solo para historial)
    wsEmit("history:new", { type: "TRIAGE_CREATED", ticketId: t.id });

    return res.status(201).json({ ticket: t });
  } catch (e) {
    next(e);
  }
});

/* Snapshot de la cola */
queueRouter.get("/queue", (_req, res) => {
  const items = queue.snapshot();
  res.json({ size: items.length, items });
});

/* Tomar siguiente (si lo usas) */
queueRouter.post("/queue/next", (_req, res) => {
  const t = queue.next();
  if (!t) return res.sendStatus(204);
  res.json({ ticket: t });
});

/* Repriorizar */
queueRouter.patch("/queue/:id/urgency", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { urgencia } = req.body ?? {};
    const ok = queue.reprioritize(id, Number(urgencia));
    if (!ok) return res.sendStatus(404);

    // opcional: guardar evento visible si quieres verlo en historial
    await HistoryModel.create({
      type: "URGENCY_UPDATED",
      at: new Date(),
      ticket: { id },
      newUrgencia: Number(urgencia),
      hidden: false,
    });
    wsEmit("history:new", { type: "URGENCY_UPDATED", ticketId: id, newUrgencia: Number(urgencia) });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/* Marcar ticket como atendido → SOLO Reportes (hidden:true) */
queueRouter.post("/queue/:id/attend", async (req, res, next) => {
  try {
    const { id } = req.params;
    const rec = queue.attend(id);
    if (!rec) return res.sendStatus(404);

    // persistir evento oculto (no aparece en historial)
    await HistoryModel.create({
      type: "QUEUE_COMPLETED",
      at: new Date(rec.attendedAt),
      ticket: {
        id: rec.id,
        patientId: rec.patientId,
        urgencia: rec.urgencia,
      },
      hidden: true, // ⬅️ clave para ocultar del Historial
    });

    // notificar sólo a Reportes (si escuchas este evento en el front)
    wsEmit("reports:update", { kind: "completed" });

    res.json({ attended: rec });
  } catch (e) {
    next(e);
  }
});

/* Métricas de la cola (ya existente) */
queueRouter.get("/queue/metrics", (_req, res) => {
  res.json(queue.metricsToday());
});

// ⚠️ IMPORTANTE: eliminado el viejo GET "/history" de este router para no chocar
