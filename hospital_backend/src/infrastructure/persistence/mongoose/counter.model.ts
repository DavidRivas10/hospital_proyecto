import mongoose, { Schema } from "mongoose";

const CounterSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

export const CounterModel = mongoose.model("Counter", CounterSchema);

export async function nextSeq(key: string): Promise<number> {
  const doc = await CounterModel.findOneAndUpdate(
    { key },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  )
    .lean()
    .exec();
  return doc!.value;
}
