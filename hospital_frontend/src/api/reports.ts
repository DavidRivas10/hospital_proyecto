import api, { apiPath } from "./http";

export async function getTriageReport(params?: { from?: string; to?: string; urgency?: number }) {
  const { data } = await api.get(apiPath("/reports/triage"), { params });
  return data as {
    total: number;
    byUrgency: Record<string, number>;
    items: any[];
  };
}

export async function getAttendedReport(params?: { from?: string; to?: string }) {
  const { data } = await api.get(apiPath("/reports/attended"), { params });
  return data as {
    total: number;
    byUrgency: Record<string, number>;
  };
}
