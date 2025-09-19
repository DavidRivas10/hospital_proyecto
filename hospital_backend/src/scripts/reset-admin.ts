import "dotenv/config";
import argon2 from "argon2";
import { connectMongo } from "../infrastructure/persistence/mongoose/connection.js";
import { User } from "../infrastructure/persistence/mongoose/models/user.model.js";

async function main() {
  await connectMongo();
  const email = process.env.ADMIN_EMAIL || "admin@hospital.local";
  const newPass = process.env.ADMIN_PASSWORD || "ChangeMe_123!";

  const u = await User.findOne({ email });
  if (!u) {
    console.log("[reset] No existe el usuario:", email, " — creando uno nuevo…");
    await User.create({
      email,
      passwordHash: await argon2.hash(newPass),
      fullName: "Administrador",
      roles: ["admin"],
      isActive: true,
    });
    console.log("[reset] Usuario creado:", email);
    process.exit(0);
  }
  u.passwordHash = await argon2.hash(newPass);
  await u.save();
  console.log("[reset] Password actualizado para:", email);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });

