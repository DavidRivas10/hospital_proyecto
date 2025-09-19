import { createServer } from "http";
import app from "./infrastructure/http/app.js";
import { initSocket } from "./infrastructure/ws/socket.js";
import { connectMongo } from "./infrastructure/persistence/mongoose/connection.js";
import { logger } from "./infrastructure/config/logger.js";
import { env } from "./infrastructure/config/env.js";
import { queueController } from "./infrastructure/http/controllers/queue.controller.js";
import { startMetricsUpdater } from "./infrastructure/monitoring/metrics.js";


async function main() {

await connectMongo();
startMetricsUpdater(5000);
  // reconstruir cola desde DB (tickets 'waiting')
  try {
    await queueController.__seedFromDb();
    logger.info("Queue seeded from DB");
  } catch (e) {
    logger.error({ e }, "Seed from DB failed (continuando igual)");
  }

  const httpServer = createServer(app);
  initSocket(httpServer);

  const port = env.PORT || 4000;
  httpServer.listen(port, () => {
    logger.info({ port }, "Server listening");
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

