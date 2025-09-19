import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    roles: { type: [String], enum: ["admin", "medico", "recepcion", "paciente"], default: ["paciente"], index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: "users" }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export type UserModel = Model<UserDoc>;
export const User: UserModel = mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);

// Sesiones de refresh token
const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    tokenHash: { type: String, required: true }, // hash del refresh token
    userAgent: { type: String },
    revokedAt: { type: Date },
  },
  { timestamps: true, versionKey: false, collection: "sessions" }
);

export type SessionDoc = InferSchemaType<typeof SessionSchema> & { _id: mongoose.Types.ObjectId };
export type SessionModel = Model<SessionDoc>;
export const Session: SessionModel = mongoose.models.Session || mongoose.model<SessionDoc>("Session", SessionSchema);
