import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

export const ESTADOS = ["waiting", "in_service", "done"] as const;
export type Estado = typeof ESTADOS[number];

const TicketSchema = new Schema(
  {
    patientId: { type: String, required: true },
    urgencia: { type: Number, required: true, min: 1, max: 3 },
    sintomas: { type: String },
    signosVitales: {
      FC: String,
      FR: String,
      TA: String,
      Temp: String,
      SpO2: String,
    },

    // campos de control de cola
    estado: { type: String, enum: ESTADOS, default: "waiting", index: true },
    arrivalSeq: { type: Number, index: true }, // para FIFO
    number: { type: Number, index: true },     // correlativo visible

    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type TicketDoc = InferSchemaType<typeof TicketSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const TicketModel: Model<TicketDoc> =
  mongoose.models.Ticket || mongoose.model<TicketDoc>("Ticket", TicketSchema);

// opcional: alias para evitar tocar imports antiguos
export { TicketModel as Ticket };
