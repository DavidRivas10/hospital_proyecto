// src/index.ts
import { createServer } from "http";
import app from "./infrastructure/http/app.js";
import { initSocket } from "./infrastructure/ws/socket.js";
import { connectMongo } from "./infrastructure/persistence/mongoose/connection.js";
import { logger } from "./infrastructure/config/logger.js";
import { env } from "./infrastructure/config/env.js";

// Import robusto del controller: tomamos el router y, si existe,
// alguna variante del helper de seed (__seedFromDb o _seedFromDb)
import * as queueController from "./infrastructure/http/controllers/queue.controller.js";
const { queueRouter } = queueController as { queueRouter: import("express").Router };
const seedQueueFromDb =
  (queueController as any).__seedFromDb ??
  (queueController as any)._seedFromDb ??
  undefined;

// Monta las rutas bajo /v1
app.use("/v1", queueRouter);

async function main() {
  await connectMongo();

  // Si el controller exporta el helper de seed, lo ejecutamos
  try {
    if (typeof seedQueueFromDb === "function") {
      await seedQueueFromDb();
      logger.info("Queue seeded from DB");
    } else {
      logger.warn("seed helper no exportado (ni __seedFromDb ni _seedFromDb); continuo sin seed");
    }
  } catch (e) {
    logger.error({ e }, "Seed from DB failed (continuando igual)");
  }

  const httpServer = createServer(app);
  initSocket(httpServer);

  const port = Number(env.PORT || process.env.PORT || 4000);
  httpServer.listen(port, () => {
    logger.info({ port }, "Server listening");
  });
}

// ❗ Eliminado el app.listen duplicado para evitar EADDRINUSE
main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

