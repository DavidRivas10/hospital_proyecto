import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

export async function connectMongo() {
  try {
    if (!env.MONGO_URI) {
      logger.warn("MONGO_URI no está definido. Arrancando sin DB.");
      return;
    }
    await mongoose.connect(env.MONGO_URI, { autoIndex: true });
    logger.info("Mongo connected");
  } catch (err) {
    logger.error({ err }, "No se pudo conectar a Mongo. Continuando sin DB para dev.");
    if (env.NODE_ENV === "production") process.exit(1);
  }
}
