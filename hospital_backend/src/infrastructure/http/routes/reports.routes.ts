import { Router } from "express";
import { HistoryModel } from "../../persistence/mongoose/models/history.model.js";
import { TicketRepo } from "../../persistence/mongoose/repositories/ticket.repo.js";

export const reportsRouter = Router();

/** Util: parseo de fechas ?from & ?to (ISO) */
function parseRange(q: any) {
  const from = q.from ? new Date(String(q.from)) : undefined;
  const to = q.to ? new Date(String(q.to)) : undefined;
  return { from, to };
}

/** /v1/reports/triage?from&to&urgency=1..5  → eventos visibles TRIAGE_CREATED */
reportsRouter.get("/triage", async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const urg = req.query.urgency ? Number(req.query.urgency) : undefined;

    const match: any = {
      type: "TRIAGE_CREATED",
      $or: [{ hidden: { $exists: false } }, { hidden: false }],
    };
    if (from || to) match.at = {};
    if (from) match.at.$gte = from;
    if (to) match.at.$lte = to;
    if (urg) match["ticket.urgencia"] = urg;

    const rows = await HistoryModel.find(match).sort({ at: -1 }).lean();

    // ejemplo: conteo por urgencia
    const counts: Record<string, number> = {};
    for (const r of rows) {
      const u = String(r.ticket?.urgencia ?? "NA");
      counts[u] = (counts[u] ?? 0) + 1;
    }

    res.json({ total: rows.length, byUrgency: counts, items: rows });
  } catch (e) {
    next(e);
  }
});

/** /v1/reports/attended?from&to  → tickets finalizados (status: done) */
reportsRouter.get("/attended", async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);

    // Usa tu agregación de TicketRepo (puedes ajustar internamente)
    const agg = await TicketRepo.summarySince(from);
    // ejemplo simple: solo estado done por urgencia
    const done = agg.filter((g: any) => g._id?.estado === "done");
    const byUrgency: Record<string, number> = {};
    for (const r of done) {
      const u = String(r._id.urgencia ?? "NA");
      byUrgency[u] = (byUrgency[u] ?? 0) + Number(r.count ?? 0);
    }

    res.json({ total: done.reduce((s: number, r: any) => s + r.count, 0), byUrgency });
  } catch (e) {
    next(e);
  }
});
