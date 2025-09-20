// src/api/queue.ts
import api, { apiPath } from "./http";

/** ---------- Tipos ---------- */
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

export type Ticket = {
  id: string;
  patientId: string;
  urgencia: number; // 1 = más urgente
  arrivalSeq: number;
  sintomas?: string;
};

/** ---------- Helpers locales para tiempos (guardados en este navegador) ---------- */
function getTicketTimes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem("ticketTimes") || "{}");
  } catch {
    return {};
  }
}

function setTicketTime(id: string, ts: number) {
  const map = getTicketTimes();
  map[id] = ts;
  localStorage.setItem("ticketTimes", JSON.stringify(map));
}

/** Hora local a la que se creó el ticket (ms desde epoch) o null */
export function getLocalCreatedAt(id: string): number | null {
  const map = getTicketTimes();
  return typeof map[id] === "number" ? map[id] : null;
}

/** Elimina el registro local (cuando el ticket es atendido) */
export function clearLocalCreatedAt(id: string) {
  const map = getTicketTimes();
  if (map[id]) {
    delete map[id];
    localStorage.setItem("ticketTimes", JSON.stringify(map));
  }
}

/** ---------- API ---------- */

/** Crear ticket de triaje */
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

  const res = await api.post(apiPath("/triage"), payload).catch((err) => {
    console.error("[triageCreate] payload:", payload, " server says:", err?.response?.data);
    throw err;
  });

  // ⬇️ Guarda hora local de creación para poder calcular espera en el Dashboard
  if (res?.data?.ticket?.id) {
    setTicketTime(res.data.ticket.id, Date.now());
  }

  // Señal para refrescar otras vistas
  sessionStorage.setItem("queue:changed", Date.now().toString());

  return res.data as { ticket: Ticket };
}

/** Obtener lista de la cola */
export async function getQueue(): Promise<{ size: number; items: Ticket[] }> {
  const { data } = await api.get(apiPath("/queue"));
  return { size: Number(data?.size ?? 0) || 0, items: Array.isArray(data?.items) ? data.items : [] };
}

/** Atender el siguiente ticket: devuelve el ticket o null si no hay */
export async function nextTicket(): Promise<null | Ticket> {
  const res = await api.post(apiPath("/queue/next")).catch((err) => {
    // 204 no entra por catch; aquí sólo errores reales
    throw err;
  });
  if (res.status === 204) return null; // sin elementos
  return (res.data?.ticket as Ticket) ?? null;
}

/**
 * Métricas mínimas derivadas de GET /v1/queue (placeholder hasta endpoint real)
 */
export async function getQueueMetrics(): Promise<{
  pendingCount: number;
  todayCompleted: number;
  avgMinutes: number | null;
}> {
  const { size } = await getQueue();
  return {
    pendingCount: size,
    todayCompleted: 0,
    avgMinutes: null,
  };
}
