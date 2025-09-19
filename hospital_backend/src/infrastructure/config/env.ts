// Cargar .env desde la raíz del proyecto de forma robusta
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sube desde src/infrastructure/config/env.ts → a la raíz (../../../.env)
config({ path: resolve(__dirname, "../../../.env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  MONGO_URI: process.env.MONGO_URI, // no ponemos fallback para detectar errores
  JWT_SECRET: process.env.JWT_SECRET ?? "replace_me",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "replace_me_too",
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN ?? "http://localhost:5173",
};


