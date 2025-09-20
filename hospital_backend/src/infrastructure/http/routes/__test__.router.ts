import { Router } from "express";
import mongoose from "mongoose";

export const testRouter = Router();

/**
 * Limpia colecciones registradas en Mongoose (para tests).
 * Si no hay conexión, no falla y retorna skipped.
 */
testRouter.post("/reset", async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ ok: true, skipped: "no-db-connection" });
    }
    const modelNames = mongoose.modelNames(); // ["Queue", "Patient", ...]
    await Promise.all(modelNames.map((name) => mongoose.model(name).deleteMany({})));
    return res.json({ ok: true, cleared: modelNames });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});
