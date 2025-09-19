import { api } from "./client";

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
  // SIN traducir a inglés; el backend espera español
  const signosVitales =
    input.signosVitales && Object.keys(input.signosVitales).length
      ? {
          FC: input.signosVitales.FC !== "" && input.signosVitales.FC != null ? Number(input.signosVitales.FC) : undefined,
          FR: input.signosVitales.FR !== "" && input.signosVitales.FR != null ? Number(input.signosVitales.FR) : undefined,
          TA: input.signosVitales.TA || undefined,
          Temp: input.signosVitales.Temp !== "" && input.signosVitales.Temp != null ? Number(input.signosVitales.Temp) : undefined,
          SpO2: input.signosVitales.SpO2 !== "" && input.signosVitales.SpO2 != null ? Number(input.signosVitales.SpO2) : undefined,
        }
      : undefined;

  const payload = {
    patientId: input.patientId.trim(),
    sintomas: input.sintomas.trim(),
    urgencia: Number(input.urgencia),
    signosVitales,
  };

  const res = await api.post("/v1/triage", payload).catch((err) => {
    console.error("[triageCreate] 400 payload:", payload, " server says:", err?.response?.data);
    throw err;
  });

  // bandera para que Dashboard refresque
  sessionStorage.setItem("queue:changed", Date.now().toString());
  return res.data; // { ticket, ... }
}

export async function getQueue() {
  const { data } = await api.get("/v1/queue");
  return data;
}

// Normalizador mínimo al shape original que mencionaste
export async function getQueueMetrics(): Promise<{
  pendingCount: number;
  todayCompleted: number;
  avgMinutes: number | null;
}> {
  const data = await getQueue();

  const pendingCount = Array.isArray(data?.pending)
    ? data.pending.length
    : Number(data?.pending ?? 0) || 0;

  const todayCompleted = Array.isArray(data?.todayCompleted)
    ? data.todayCompleted.length
    : Number(data?.todayCompleted ?? 0) || 0;

  const avgMinutes =
    typeof data?.avgMinutes === "number" && isFinite(data.avgMinutes)
      ? data.avgMinutes
      : null;

  return { pendingCount, todayCompleted, avgMinutes };
}
