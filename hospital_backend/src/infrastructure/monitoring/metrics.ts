import client from "prom-client";
import mongoose from "mongoose";
import { queueMetrics } from "../http/controllers/queue.controller.js";

const Registry = client.Registry;
export const registry = new Registry();

client.collectDefaultMetrics({ register: registry, prefix: "hospital_" });

const gMongo = new client.Gauge({ name: "hospital_mongo_connected", help: "1 si mongoose conectado" });
const gQueue = new client.Gauge({ name: "hospital_queue_size", help: "Tamaño de la cola" });

registry.registerMetric(gMongo);
registry.registerMetric(gQueue);

export function startMetricsUpdater(intervalMs = 5000) {
  setInterval(() => {
    gMongo.set(mongoose.connection.readyState === 1 ? 1 : 0);
    try {
      gQueue.set(queueMetrics.size());
    } catch {
      gQueue.set(0);
    }
  }, intervalMs);
}
