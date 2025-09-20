import mongoose, { Schema } from "mongoose";

const HistorySchema = new Schema(
  {
    // TRIAGE_CREATED, PATIENT_CREATED, URGENCY_UPDATED, QUEUE_COMPLETED, etc.
    type: { type: String, required: true },
    at: { type: Date, required: true, default: () => new Date() },

    // datos de ticket cuando aplique
    ticket: {
      id: { type: String },
      patientId: { type: String },
      urgencia: { type: Number },
      number: { type: Number },
      arrivalSeq: { type: Number },
    },

    // cambios de urgencia (si lo usas más adelante)
    prevUrgencia: { type: Number },
    newUrgencia: { type: Number },

    // visibilidad en el feed del Historial
    hidden: { type: Boolean, default: false },
  },
  { versionKey: false }
);

export type HistoryDoc = mongoose.InferSchemaType<typeof HistorySchema>;
export const HistoryModel = mongoose.model<HistoryDoc>("History", HistorySchema);
