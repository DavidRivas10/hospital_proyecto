import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const TicketSchema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    sintomas: { type: String, required: true },
    signosVitales: {
      FC: { type: Number },
      FR: { type: Number },
      TA: { type: String },
      Temp: { type: Number },
      SpO2: { type: Number },
    },
    urgencia: { type: Number, enum: [1, 2, 3], required: true, index: true },
    llegadaAt: { type: Date, required: true, index: true },
    arrivalSeq: { type: Number, required: true, index: true },
    estado: { type: String, enum: ["waiting", "in_service", "done"], required: true, index: true },
    startedAt: { type: Date },   // cuándo pasó a in_service
    finishedAt: { type: Date },  // cuándo se completó (done)
  },
  { timestamps: true, versionKey: false, collection: "tickets" }
);

export type TicketDoc = InferSchemaType<typeof TicketSchema> & { _id: mongoose.Types.ObjectId };
export type TicketModel = Model<TicketDoc>;

export const Ticket: TicketModel =
  mongoose.models.Ticket || mongoose.model<TicketDoc>("Ticket", TicketSchema);
