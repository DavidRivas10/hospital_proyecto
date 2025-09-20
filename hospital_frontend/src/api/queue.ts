// src/api/queue.ts
import api, { apiPath } from "./http";

// UI en español (como tu schema)
export type TriageCreateInputUI = {
  patientId: string;
  sintomas: string;
  urgencia: number;
  signosVitales?: {
    FC?: string | number;
    FR?: string | number;
    TA?: string;
    Temp?: string | number;
    SpO2?: string | number;
  };
};

export async function triageCreate(input: TriageCreateInputUI) {
  const signosVitales =
    input.signosVitales && Object.keys(input.signosVitales).length
      ? {
          FC:
            input.signosVitales.FC !== "" && input.signosVitales.FC != null
              ? Number(input.signosVitales.FC)
              : undefined,
          FR:
            input.signosVitales.FR !== "" && input.signosVitales.FR != null
              ? Number(input.signosVitales.FR)
              : undefined,
          TA: input.signosVitales.TA || undefined,
          Temp:
            input.signosVitales.Temp !== "" && input.signosVitales.Temp != null
              ? Number(input.signosVitales.Temp)
              : undefined,
          SpO2:
            input.signosVitales.SpO2 !== "" && input.signosVitales.SpO2 != null
              ? Number(input.signosVitales.SpO2)
              : undefined,
        }
      : undefined;

  const payload = {
    patientId: input.patientId.trim(),
    sintomas: input.sintomas.trim(),
    urgencia: Number(input.urgencia),
    signosVitales,
  };

  try {
    const res = await api.post(apiPath("/triage"), payload);
    // bandera para que Dashboard refresque
    sessionStorage.setItem("queue:changed", Date.now().toString());
    return res.data; // { ticket }
  } catch (err: any) {
    console.error(
      "[triageCreate] payload:",
      payload,
      " server says:",
      err?.response?.data
    );
    throw err;
  }
}

export async function getQueue() {
  const { data } = await api.get(apiPath("/queue")); // -> /v1/queue
  return data; // { size, items }
}

/**
 * Métricas mínimas derivadas de GET /v1/queue
 * Backend devuelve { size, items }. No hay "todayCompleted" ni "avgMinutes" aún,
 * así que devolvemos 0 y null respectivamente para no romper la UI.
 */
export async function getQueueMetrics(): Promise<{
  pendingCount: number;
  todayCompleted: number;
  avgMinutes: number | null;
}> {
  const data = await getQueue();
  const pendingCount = Number(data?.size ?? 0) || 0;

  return {
    pendingCount,
    todayCompleted: 0,  // placeholder hasta que exista endpoint real
    avgMinutes: null,   // placeholder
  };
}
