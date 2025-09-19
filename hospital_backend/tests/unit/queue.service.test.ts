import { describe, it, expect } from "vitest";
import { QueueService } from "../../src/domain/services/queue/queue.service.js";

describe("QueueService", () => {
  it("enqueue + next respetan la prioridad clínica y FIFO", () => {
    const q = new QueueService();

    const t1 = q.enqueue({ patientId: "p1", sintomas: "dolor leve", urgencia: 3 });
    const t2 = q.enqueue({ patientId: "p2", sintomas: "fiebre alta", urgencia: 1 });
    const t3 = q.enqueue({ patientId: "p3", sintomas: "tos", urgencia: 1 });
    const t4 = q.enqueue({ patientId: "p4", sintomas: "dolor moderado", urgencia: 2 });

    expect(q.size).toBe(4);
    // Orden esperado: t2(u1, seq2), t3(u1, seq3), t4(u2, seq4), t1(u3, seq1)
    const n1 = q.next()!;
    const n2 = q.next()!;
    const n3 = q.next()!;
    const n4 = q.next()!;

    expect([n1.patientId, n2.patientId, n3.patientId, n4.patientId]).toEqual(["p2", "p3", "p4", "p1"]);
    expect(q.size).toBe(0);
    expect(q.next()).toBeUndefined();
  });

  it("peek no extrae", () => {
    const q = new QueueService();
    const t = q.enqueue({ patientId: "pX", sintomas: "cefalea", urgencia: 2 });
    const pk = q.peek();
    expect(pk?.id).toBe(t.id);
    expect(q.size).toBe(1);
  });

  it("reprioritize mueve correctamente un ticket ya en cola", () => {
    const q = new QueueService();
    const a = q.enqueue({ patientId: "a", sintomas: "leve", urgencia: 3 });
    const b = q.enqueue({ patientId: "b", sintomas: "media", urgencia: 2 });
    const c = q.enqueue({ patientId: "c", sintomas: "alta", urgencia: 1 });

    // 'a' empeora a urgencia 1; debe salir antes que 'b' pero después de 'c' (por FIFO)
    const ok = q.reprioritize(a.id, 1);
    expect(ok).toBe(true);

    const n1 = q.next()!;
    const n2 = q.next()!;
    const n3 = q.next()!;

    expect([n1.patientId, n2.patientId, n3.patientId]).toEqual(["c", "a", "b"]);
  });

  it("snapshot refleja el contenido", () => {
    const q = new QueueService();
    q.enqueue({ patientId: "p1", sintomas: "x", urgencia: 2 });
    q.enqueue({ patientId: "p2", sintomas: "y", urgencia: 1 });
    const snap = q.snapshot();
    expect(snap.length).toBe(2);
    expect(snap[0]).toHaveProperty("id");
    expect(snap[0]).toHaveProperty("patientId");
    expect(snap[0]).toHaveProperty("urgencia");
    expect(snap[0]).toHaveProperty("arrivalSeq");
  });
});
