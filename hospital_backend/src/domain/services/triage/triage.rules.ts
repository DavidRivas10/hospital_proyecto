import type { Urgencia } from "../../models/ticket.js"; // 👈 sin .js porque es SOLO tipo

export type Signos = {
  FC?: number;
  FR?: number;
  TA?: string;
  Temp?: number;
  SpO2?: number;
};

export type TriageResult = {
  urgencia: Urgencia;
  reasons: string[];
};

function parseTA(ta?: string): { sys?: number; dia?: number } {
  if (!ta) return {};
  const m = ta.match(/^(\d{2,3})\D+(\d{2,3})$/);
  if (!m) return {};
  return { sys: Number(m[1]), dia: Number(m[2]) };
}

export function applyTriageRules(baseUrgencia: Urgencia, sv?: Signos): TriageResult {
  let u: Urgencia = baseUrgencia;
  const reasons: string[] = [];
  if (!sv) return { urgencia: u, reasons };

  if (typeof sv.SpO2 === "number" && sv.SpO2 < 90) {
    if (u > 1) u = 1;
    reasons.push("SpO2 < 90%");
  }
  if (typeof sv.Temp === "number") {
    if (sv.Temp >= 39.5) {
      if (u > 1) u = 1;
      reasons.push("Fiebre alta (≥39.5°C)");
    } else if (sv.Temp >= 38.5 && u > 2) {
      u = 2;
      reasons.push("Fiebre moderada (38.5–39.4°C)");
    }
  }
  if (typeof sv.FC === "number") {
    if (sv.FC > 130) {
      if (u > 1) u = 1;
      reasons.push("Taquicardia severa (FC>130)");
    } else if (sv.FC >= 110 && u > 2) {
      u = 2;
      reasons.push("Taquicardia (FC 110–130)");
    }
  }
  if (typeof sv.FR === "number") {
    if (sv.FR > 30) {
      if (u > 1) u = 1;
      reasons.push("Taquipnea severa (FR>30)");
    } else if (sv.FR >= 22 && u > 2) {
      u = 2;
      reasons.push("Taquipnea (FR 22–30)");
    }
  }
  const ta = parseTA(sv.TA);
  if (typeof ta.sys === "number" && ta.sys < 90) {
    if (u > 1) u = 1;
    reasons.push("Hipotensión (TAS<90)");
  }

  return { urgencia: u, reasons };
}
