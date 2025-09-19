import { User, type UserDoc, Session } from "../models/user.model.js";

export const UserRepo = {
  async findByEmail(email: string): Promise<UserDoc | null> {
    return User.findOne({ email }).lean().exec();
  },
  async create(u: Omit<UserDoc, "_id" | "createdAt" | "updatedAt">): Promise<UserDoc> {
    const doc = await User.create(u);
    return doc.toObject() as UserDoc;
  },
  async findById(id: string): Promise<UserDoc | null> {
    return User.findById(id).lean().exec();
  },
};

export const SessionRepo = {
  async create(userId: string, tokenHash: string, userAgent?: string) {
    const s = await Session.create({ userId, tokenHash, userAgent });
    return s.toObject();
  },
  async revoke(tokenHash: string): Promise<boolean> {
    const res = await Session.updateOne({ tokenHash }, { $set: { revokedAt: new Date() } }).exec();
    return res.acknowledged && res.modifiedCount >= 1;
  },
  async isValid(tokenHash: string): Promise<boolean> {
    const s = await Session.findOne({ tokenHash, revokedAt: { $exists: false } }).lean().exec();
    return !!s;
  },
};
