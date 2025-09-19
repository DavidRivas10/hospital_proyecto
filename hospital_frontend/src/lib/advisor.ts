// src/lib/advisor.ts
import type { Urgencia } from "../types";

export type AdviceOutput = { urgencia: Urgencia; reasons: string[]; recommendation: string };

export function advise(input: { sintomas: string; vitales?: { FC?: number; FR?: number; TA?: string; Temp?: number; SpO2?: number } }): AdviceOutput {
  const reasons: string[] = [];
  let u: Urgencia = 3;

  const t = (input.sintomas || "").toLowerCase();
  if (t.includes("dolor torácico") || t.includes("disnea") || t.includes("convuls")) {
    u = 1; reasons.push("Síntomas de alta gravedad");
  }
  if (input.vitales?.SpO2 !== undefined && input.vitales.SpO2 < 90) {
    u = 1; reasons.push("SpO2 < 90%");
  }
  if (input.vitales?.Temp !== undefined && input.vitales.Temp >= 39.5 && u > 1) {
    u = 1; reasons.push("Fiebre alta ≥39.5°C");
  } else if (input.vitales?.Temp !== undefined && input.vitales.Temp >= 38.5 && u > 2) {
    u = 2; reasons.push("Fiebre moderada 38.5–39.4°C");
  }

  return { urgencia: u, reasons, recommendation: u === 1 ? "Atención inmediata" : u === 2 ? "Atención prioritaria" : "Consulta regular" };
}
