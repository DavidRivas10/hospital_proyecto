import { Router } from "express";
import { randomUUID } from "crypto";

const router = Router();

// Memoria temporal para que /queue y /queue/next funcionen en tests
const memory: any[] = []; // [{ id, patientId, urgencia, estado, createdAt }]

router.post("/", (req, res) => {
  const { patientId, urgencia = 3, sintomas, signosVitales } = req.body || {};
  const id = randomUUID();
  const ticket = {
    id,
    patientId,
    urgencia,
    sintomas,
    signosVitales,
    estado: "waiting",
    createdAt: new Date().toISOString(),
  };
  memory.push(ticket);
  return res.status(201).json({ ticket });
});

// Exporta el arreglo para que queue.router pueda usarlo
export const triageMemory = memory;

export default router;
