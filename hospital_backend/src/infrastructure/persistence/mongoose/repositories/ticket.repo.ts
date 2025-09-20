import { TicketModel as Ticket, type TicketDoc } from "../models/ticket.model.js";

export type CreateTicketInput = Omit<TicketDoc, "_id" | "createdAt" | "updatedAt">;

export const TicketRepo = {
  async create(data: CreateTicketInput): Promise<TicketDoc> {
    const doc = await Ticket.create(data);
    return doc.toObject() as TicketDoc;
  },

  async updateById(id: string, patch: Partial<TicketDoc>): Promise<boolean> {
    const res = await Ticket.updateOne({ _id: id }, { $set: patch }).exec();
    return res.acknowledged === true && res.modifiedCount >= 1;
  },

  async findWaiting(): Promise<TicketDoc[]> {
    return Ticket.find({ estado: "waiting" }).sort({ urgencia: 1, arrivalSeq: 1 }).lean().exec();
  },

  async setInService(id: string, startedAt: Date): Promise<boolean> {
    return this.updateById(id, { estado: "in_service", startedAt });
  },

  async setDone(id: string, finishedAt: Date): Promise<boolean> {
    return this.updateById(id, { estado: "done", finishedAt });
  },

  async summarySince(since?: Date) {
    const match: any = since ? { createdAt: { $gte: since } } : {};
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: { estado: "$estado", urgencia: "$urgencia" },
          count: { $sum: 1 },
        },
      },
    ];
    return Ticket.aggregate(pipeline).exec();
  },
};
