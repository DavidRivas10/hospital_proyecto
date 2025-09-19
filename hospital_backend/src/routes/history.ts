// src/routes/history.ts
import { Router } from "express";
// import HistoryModel from "../models/History"; // si ya existe

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100), 2000);

    // Si tienes modelo real:
    // const items = await HistoryModel.find({})
    //   .sort({ createdAt: -1 })
    //   .limit(limit)
    //   .lean();

    // Placeholder seguro:
    const items: any[] = [];

    return res.json(items);
  } catch (e) {
    console.error("[history] GET /v1/history error", e);
    return res.status(500).json({ error: "history_unavailable" });
  }
});

export default router;
