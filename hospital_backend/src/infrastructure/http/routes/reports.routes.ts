import { Router } from "express";
import { HistoryModel } from "../../persistence/mongoose/models/history.model.js";

export const reportsRouter = Router();

// GET /v1/reports/daily
reportsRouter.get("/reports/daily", async (_req, res, next) => {
  try {
    const rows = await HistoryModel.aggregate([
      { $match: { type: { $in: ["TRIAGE_CREATED", "QUEUE_NEXT"] } } },
      { $group: {
          _id: {
            day:  { $dateToString: { date: "$at", format: "%Y-%m-%d" } },
            type: "$type"
          },
          count: { $sum: 1 }
      } }
    ]);

    const byDay: Record<string, { triage?: number; atendidos?: number }> = {};
    for (const r of rows) {
      const d = r._id.day as string;
      const t = r._id.type as string;
      byDay[d] ||= {};
      if (t === "TRIAGE_CREATED") byDay[d].triage = r.count;
      if (t === "QUEUE_NEXT")    byDay[d].atendidos = r.count;
    }
    res.json(byDay);
  } catch (e) { next(e); }
});
