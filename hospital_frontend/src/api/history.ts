import { api } from "./client";

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
export async function getHistory(limitOrOpts?: number | { limit?: number }): Promise<HistoryItem[]> {
  const limit = typeof limitOrOpts === "number" ? limitOrOpts : (limitOrOpts?.limit ?? 500);
  try {
    const { data } = await api.get(`/v1/history?limit=${limit}`);
    return Array.isArray(data) ? data : data?.items ?? [];
  } catch (err: any) {
    // Si no existe ese endpoint aún, no rompas la UI
    if (err?.response?.status === 404) return [];
    throw err;
  }
}
