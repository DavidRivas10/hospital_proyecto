// src/api/history.ts
import { api as client} from "./client";

export type HistoryItem = {
  id: string;
  type: string;
  at: string;
  ticket?: {
    id: string;
    patientId: string;
    urgencia?: number;
  };
  prevUrgencia?: number;
  newUrgencia?: number;
};

// Soporta getHistory(500) y getHistory({ limit: 500 })
export async function getHistory(
  limitOrOpts?: number | { limit?: number }
): Promise<HistoryItem[]> {
  const limit =
    typeof limitOrOpts === "number" ? limitOrOpts : limitOrOpts?.limit ?? 500;

  try {
    // Base URL sin /v1 -> aquí sí incluimos /v1
const { data } = await client.get("/history", { params: { limit } });
    return Array.isArray(data) ? data : data?.items ?? [];
  } catch (err: any) {
    if (err?.response?.status === 404) return []; // no rompas la UI si aún no existe
    throw err;
  }
}


