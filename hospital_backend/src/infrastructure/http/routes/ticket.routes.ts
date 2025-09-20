import { Router, Request, Response, NextFunction } from "express";
import { TicketModel } from "../../persistence/mongoose/models/ticket.model.js";
import { nextSeq } from "../../persistence/mongoose/counter.model.js";
import { HistoryModel } from "../../persistence/mongoose/models/history.model.js";
export const ticketRouter = Router();

/**
 * Crea un ticket de triaje y devuelve el número correlativo.
 * POST /v1/triage
 * body: { patientId: string, urgencia?: number, sintomas?: string, signosVitales?: { fc?, fr?, ta?, temp?, spo2? } }
 */
ticketRouter.post(
  "/triage",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { patientId, urgencia, sintomas, signosVitales } = req.body || {};
      if (!patientId) {
        return res.status(400).json({ error: "patientId es requerido" });
      }

      // 1) obtener número correlativo antes de crear (evita un save extra)
      const number = await nextSeq("triage_ticket");

      // 2) crear ticket
      const created = await TicketModel.create({
        patientId,
        urgencia: Number.isInteger(urgencia) ? urgencia : 3,
        sintomas: sintomas ?? "",
        signosVitales: signosVitales ?? undefined,
        number,
        status: "pending",
      });

      // 3) registrar en historial
      await HistoryModel.create({
        type: "TRIAGE_CREATED",
        ticket: {
          id: String(created._id),
          patientId: created.patientId,
          urgencia: created.urgencia,
          number: created.number,
        },
      });

      // 4) responder
      return res.status(201).json({ ticket: created });
    } catch (e) {
      next(e);
    }
  }
);

/**
 * (Opcional) marcar siguiente como atendido: POST /v1/queue/next
 * Cuando implementes tu lógica de "atender" recuerda registrar QUEUE_NEXT.
 */
// ticketRouter.post("/queue/next", async (req, res, next) => {
//   try {
//     const ticket = await TicketModel.findOneAndUpdate(
//       { status: "pending" },
//       { $set: { status: "attended", attendedAt: new Date() } },
//       { sort: { createdAt: 1 }, new: true }
//     );
//     if (!ticket) return res.status(204).end();
//     await HistoryModel.create({
//       type: "QUEUE_NEXT",
//       ticket: {
//         id: String(ticket._id),
//         patientId: ticket.patientId,
//         urgencia: ticket.urgencia,
//         number: ticket.number,
//       },
//     });
//     res.json({ ticket });
//   } catch (e) { next(e); }
// });
