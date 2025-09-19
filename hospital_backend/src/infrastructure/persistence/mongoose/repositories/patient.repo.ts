import { Patient, type PatientDoc } from "../models/patient.model.js";

export type CreatePatientInput = Omit<PatientDoc, "_id" | "createdAt" | "updatedAt">;

export const PatientRepo = {
  async create(data: CreatePatientInput): Promise<PatientDoc> {
    const doc = await Patient.create(data);
    return doc.toObject() as PatientDoc;
  },

  async findById(id: string): Promise<PatientDoc | null> {
    return Patient.findById(id).lean().exec();
  },

  async findByDocId(docId: string): Promise<PatientDoc | null> {
    return Patient.findOne({ docId }).lean().exec();
  },

  async updateById(id: string, patch: Partial<PatientDoc>): Promise<boolean> {
    const res = await Patient.updateOne({ _id: id }, { $set: patch }).exec();
    return res.acknowledged && res.modifiedCount >= 1;
  },

  async searchByName(q: string, limit = 20): Promise<PatientDoc[]> {
    return Patient.find({ fullName: { $regex: q, $options: "i" } }).limit(limit).lean().exec();
  },
};
