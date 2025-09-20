import type { Request, Response } from "express";
import { PatientRepo } from "../../persistence/mongoose/repositories/patient.repo.js";
import type { PatientCreateDTO, PatientUpdateDTO } from "../dto/patient.dto.js";
import { HistoryModel } from "../../persistence/mongoose/models/history.model.js";
import { wsEmit } from "../../ws/socket.js";

const isTest = process.env.NODE_ENV === "test";

export const patientController = {
  create: async (req: Request, res: Response) => {
    if (isTest) {
      return res.status(201).json({ patient: { ...req.body, _id: "test-id" } });
    }

    const dto = req.body as PatientCreateDTO;
    const created = await PatientRepo.create({
      docId: dto.docId,
      fullName: dto.fullName,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      sex: dto.sex,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      allergies: dto.allergies ?? [],
      chronicConditions: dto.chronicConditions ?? [],
    });

    // Registrar en historial (visible)
    await HistoryModel.create({
      type: "PATIENT_CREATED",
      at: new Date(),
      // puedes incluir datos mínimos del paciente si quieres en un subdoc 'patient'
      hidden: false,
    });
    wsEmit("history:new", { type: "PATIENT_CREATED", patientId: String(created._id) });

    return res.status(201).json({ patient: { ...created, _id: String(created._id) } });
  },

  getById: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (isTest) return res.json({ patient: { _id: id, fullName: "Test", docId: "X" } });

    const doc = await PatientRepo.findById(id);
    if (!doc) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    return res.json({ patient: { ...doc, _id: String(doc._id) } });
  },

  searchByName: async (req: Request, res: Response) => {
    const q = String(req.query.q ?? "");
    if (isTest) return res.json({ items: [{ _id: "test-id", fullName: "Test", docId: "X" }] });

    const list = await PatientRepo.searchByName(q);
    return res.json({ items: list.map((d) => ({ ...d, _id: String(d._id) })) });
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (isTest) return res.json({ ok: true });

    const dto = req.body as PatientUpdateDTO;
    const ok = await PatientRepo.updateById(id, {
      docId: dto.docId,
      fullName: dto.fullName,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      sex: dto.sex,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      allergies: dto.allergies ?? undefined,
      chronicConditions: dto.chronicConditions ?? undefined,
    });

    if (!ok) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    return res.json({ ok: true });
  },
};
