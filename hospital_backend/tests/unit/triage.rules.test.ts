import { describe, it, expect } from "vitest";
import { applyTriageRules } from "../../src/domain/services/triage/triage.rules.js"; // 👈 sin extensión

describe("TriageRules", () => {
  it("sube a urgencia 1 si SpO2 < 90", () => {
    const r = applyTriageRules(3, { SpO2: 88 });
    expect(r.urgencia).toBe(1);
  });

  it("sube a 2 si fiebre moderada", () => {
    const r = applyTriageRules(3, { Temp: 39 });
    expect(r.urgencia).toBe(2);
  });

  it("mantiene base si todo normal", () => {
    const r = applyTriageRules(2, { SpO2: 98, Temp: 36.8 });
    expect(r.urgencia).toBe(2);
  });
});


