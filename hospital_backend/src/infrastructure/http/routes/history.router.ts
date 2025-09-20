import { Router } from "express";
import { HistoryModel } from "../../persistence/mongoose/models/history.model.js";

export const historyRouter = Router();

historyRouter.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 500, 2000);
    const items = await HistoryModel
      .find({})
      .sort({ at: -1 })
      .limit(limit)
      .lean()
      .exec();

    res.json({ items });
  } catch (e) {
    next(e);
  }
});
