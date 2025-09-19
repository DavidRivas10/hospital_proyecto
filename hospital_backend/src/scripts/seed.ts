// src/scripts/seed.ts
import argon2 from "argon2";
import { connectMongo } from "../infrastructure/persistence/mongoose/connection.js";
import { User } from "../infrastructure/persistence/mongoose/models/user.model.js";
import "dotenv/config";

async function main() {
  await connectMongo();

  const email = process.env.ADMIN_EMAIL || "admin@hospital.local";
  const pass = process.env.ADMIN_PASSWORD || "ChangeMe_123!";
  const name = process.env.ADMIN_NAME || "Administrador";

  const existing = await User.findOne({ email }).lean().exec();
  if (existing) {
    console.log("[seed] Admin ya existe:", email);
    process.exit(0);
  }

  const passwordHash = await argon2.hash(pass);
  await User.create({
    email,
    passwordHash,
    fullName: name,
    roles: ["admin"],
    isActive: true,
  });

  console.log("[seed] Admin creado:", email);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
