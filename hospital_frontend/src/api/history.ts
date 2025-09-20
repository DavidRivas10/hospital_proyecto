// src/api/history.ts
import api, { apiPath } from "./http";

export type HistoryCreated = {
  type: "created";
  at: number;
  ticket: {
    id: string;
    patientId: string;
    urgencia: number;
    arrivalSeq: number;
    enqueuedAt: number;
    sintomas?: string;
  };
};

export type HistoryAttended = {
  type: "attended";
  at: number;
  attended: {
    id: string;
    patientId: string;
    urgencia: number;
    enqueuedAt: number;
    attendedAt: number;
    waitedMs: number;
  };
};

export type HistoryEvent = HistoryCreated | HistoryAttended;

export async function getHistory(
  limitOrOpts?: number | { limit?: number }
): Promise<HistoryEvent[]> {
  const limit =
    typeof limitOrOpts === "number" ? limitOrOpts : limitOrOpts?.limit ?? 500;

  try {
    const { data } = await api.get(apiPath("/history"), { params: { limit } });
    const items = Array.isArray(data?.items) ? data.items : [];
    return items as HistoryEvent[];
  } catch (err: any) {
    if (err?.response?.status === 404) return [];
    throw err;
  }
}
