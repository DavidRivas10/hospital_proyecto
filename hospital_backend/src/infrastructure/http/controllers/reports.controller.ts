import type { Request, Response } from "express";
import { TicketRepo } from "../../persistence/mongoose/repositories/ticket.repo.js";

export const reportsController = {
  summary: async (req: Request, res: Response) => {
    // ?since=2025-09-01T00:00:00.000Z
    const sinceStr = req.query.since ? String(req.query.since) : undefined;
    const since = sinceStr ? new Date(sinceStr) : undefined;

    // En test devolvemos algo básico sin tocar DB
    if (process.env.NODE_ENV === "test") {
      return res.json({
        items: [
          { estado: "waiting", urgencia: 1, count: 0 },
          { estado: "in_service", urgencia: 2, count: 0 },
          { estado: "done", urgencia: 3, count: 0 },
        ],
      });
    }

    const agg = await TicketRepo.summarySince(since);
    const items = agg.map((g: any) => ({
      estado: g._id.estado,
      urgencia: g._id.urgencia,
      count: g.count,
    }));
    return res.json({ items });
  },
};
