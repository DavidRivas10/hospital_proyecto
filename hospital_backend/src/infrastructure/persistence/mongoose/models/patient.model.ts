import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const PatientSchema = new Schema(
  {
    docId: { type: String, required: true, index: true }, // DNI/Cédula/ID interno
    fullName: { type: String, required: true, index: true },
    birthDate: { type: Date, required: false },
    sex: { type: String, enum: ["M", "F", "O"], required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    address: { type: String, required: false },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
  },
  { timestamps: true, versionKey: false, collection: "patients" }
);

export type PatientDoc = InferSchemaType<typeof PatientSchema> & { _id: mongoose.Types.ObjectId };
export type PatientModel = Model<PatientDoc>;

export const Patient: PatientModel =
  mongoose.models.Patient || mongoose.model<PatientDoc>("Patient", PatientSchema);
