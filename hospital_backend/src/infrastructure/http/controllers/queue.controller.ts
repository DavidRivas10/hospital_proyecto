import type { Request, Response } from "express";
import { Types } from "mongoose";

import { QueueService } from "../../../domain/services/queue/queue.service.js";
import type { TriageCreateDTO } from "../dto/triage.dto.js";
import type { ReprioritizeDTO } from "../dto/queue.dto.js";
import type { TriageTicket } from "../../../domain/models/ticket.js";
import { TicketRepo } from "../../persistence/mongoose/repositories/ticket.repo.js";
import { applyTriageRules } from "../../../domain/services/triage/triage.rules.js";
import { HistoryService, type HistoryItem } from "../../../domain/services/history/history.service.js";
import { wsEmit } from "../../ws/socket.js";

const queue = new QueueService();
const history = new HistoryService(500);
const isTest = process.env.NODE_ENV === "test";

export const queueMetrics = {
  size: () => queue.size,
};

function broadcastQueue() {
  wsEmit("queue:update", { items: queue.snapshot(), size: queue.size });
}
function broadcastHistory() {
  wsEmit("history:update", { size: history.size() });
}

export const queueController = {
  // Crea ticket (aplica reglas), persiste si no es test, encola y notifica
  triageCreate: async (req: Request, res: Response) => {
    const dto = req.body as TriageCreateDTO;

    const ruled = applyTriageRules(dto.urgencia, dto.signosVitales);
    const finalUrgencia = ruled.urgencia;

    if (isTest) {
      const ticket = queue.enqueue({
        patientId: dto.patientId,
        sintomas: dto.sintomas,
        signosVitales: dto.signosVitales,
        urgencia: finalUrgencia,
      });
      broadcastQueue();
      return res.status(201).json({ ticket, autoReasons: ruled.reasons });
    }

    const mongoDoc = await TicketRepo.create({
      patientId: dto.patientId,
      sintomas: dto.sintomas,
      signosVitales: dto.signosVitales,
      urgencia: finalUrgencia,
      llegadaAt: new Date(),
      arrivalSeq: 0,
      estado: "waiting",
    });

    const ticket = queue.enqueueWithId(String(mongoDoc._id), {
      patientId: dto.patientId,
      sintomas: dto.sintomas,
      signosVitales: dto.signosVitales,
      urgencia: finalUrgencia,
    });

    await TicketRepo.updateById(String(mongoDoc._id), {
      arrivalSeq: ticket.arrivalSeq,
      llegadaAt: new Date(ticket.llegadaAt),
    });

    broadcastQueue();
    return res.status(201).json({ ticket, autoReasons: ruled.reasons });
  },

  getQueue: (_req: Request, res: Response) => {
    const snap = queue.snapshot();
    return res.json({ items: snap, size: queue.size });
  },

  // Siguiente a atender: pasa a in_service y notifica
  next: async (_req: Request, res: Response) => {
    const nxt = queue.next();
    if (!nxt) return res.status(204).send();

    const startedAt = new Date();
    if (!isTest) {
      await TicketRepo.setInService(String(nxt.id), startedAt);
    }

    // guardamos en historial (in_service) con startedAt
    const hist: HistoryItem = {
      id: nxt.id,
      patientId: nxt.patientId,
      urgencia: nxt.urgencia,
      llegadaAt: nxt.llegadaAt,
      startedAt: startedAt.toISOString(),
    };
    history.add(hist);


    broadcastQueue();
    broadcastHistory();
    return res.json({ ticket: nxt });
  },

  // Completar atención: marca done, pone finishedAt y notifica
  complete: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (!isTest && !Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: { code: "NOT_FOUND" } });
    }

    const finishedAt = new Date();

    if (!isTest) {
      const ok = await TicketRepo.setDone(id, finishedAt);
      if (!ok) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    }

    // actualiza el último item del mismo id en historial (si existe) con finishedAt
    const items = history.toArray();
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].id === id) {
        items[i].finishedAt = finishedAt.toISOString();
        break;
      }
    }

    broadcastHistory();
    return res.json({ ok: true, finishedAt: finishedAt.toISOString() });
  },

  // Repriorizar: reubica y notifica
  reprioritize: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (!isTest && !Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: { code: "NOT_FOUND" } });
    }

    const body = req.body as ReprioritizeDTO;
    const ok = queue.reprioritize(id, body.urgencia);
    if (!ok) {
      return res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "Ticket no está en cola" } });
    }

    if (!isTest) {
      const snap = queue.snapshot();
      const found = snap.find((x) => x.id === id);
      if (found) {
        await TicketRepo.updateById(id, { urgencia: body.urgencia, arrivalSeq: found.arrivalSeq });
      }
    }

    broadcastQueue();
    return res.json({ ok: true });
  },

  // SOLO TEST: reset
  __testReset: (_req: Request, res: Response) => {
    if (!isTest) return res.status(404).end();
    queue.clear();
    history.clear();
    broadcastQueue();
    broadcastHistory();
    return res.json({ ok: true });
  },

  // Bootstrap: reconstrucción desde DB al arrancar
  __seedFromDb: async (): Promise<void> => {
    if (isTest) return;

    const waiting = await TicketRepo.findWaiting();
    const normSV = (d: any): TriageTicket["signosVitales"] => {
      const sv = d?.signosVitales;
      if (!sv) return undefined;
      return {
        FC: typeof sv.FC === "number" ? sv.FC : undefined,
        FR: typeof sv.FR === "number" ? sv.FR : undefined,
        TA: typeof sv.TA === "string" ? sv.TA : undefined,
        Temp: typeof sv.Temp === "number" ? sv.Temp : undefined,
        SpO2: typeof sv.SpO2 === "number" ? sv.SpO2 : undefined,
      };
    };
    const items = waiting.map<TriageTicket>((d) => ({
      id: String(d._id),
      patientId: d.patientId,
      sintomas: d.sintomas,
      signosVitales: normSV(d),
      urgencia: d.urgencia as 1 | 2 | 3,
      llegadaAt: new Date(d.llegadaAt).toISOString(),
      arrivalSeq: d.arrivalSeq,
      estado: "waiting",
    }));

    queue.seed(items);
  },

  // Exponer historial
  getHistory: (_req: Request, res: Response) => {
    return res.json({ size: history.size(), items: history.toArray() });
  },
};

