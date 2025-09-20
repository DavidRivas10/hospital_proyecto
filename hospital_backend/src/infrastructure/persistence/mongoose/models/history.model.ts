import mongoose, { Schema } from "mongoose";

const HistorySchema = new Schema(
  {
    type: { type: String, required: true }, // TRIAGE_CREATED, URGENCY_UPDATED, QUEUE_NEXT
    at: { type: Date, required: true, default: () => new Date() },
    ticket: {
      id: { type: String },
      patientId: { type: String },
      urgencia: { type: Number },
      number: { type: Number },
    },
    prevUrgencia: { type: Number },
    newUrgencia: { type: Number },
  },
  { versionKey: false }
);

export type HistoryDoc = mongoose.InferSchemaType<typeof HistorySchema>;
export const HistoryModel = mongoose.model<HistoryDoc>("History", HistorySchema);
