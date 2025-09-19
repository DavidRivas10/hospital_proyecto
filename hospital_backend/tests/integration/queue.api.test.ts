import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createServer, Server } from "http";
// Si tu Vitest necesita extensión .js, usa: import app from "../../src/infrastructure/http/app.js";
import app from "../../src/infrastructure/http/app.js";

let server: Server;
const api = () => request(server);

beforeAll(async () => {
  server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve)); // puerto aleatorio
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

// 🔧 Muy importante: limpiar estado antes de cada test
beforeEach(async () => {
  await api().post("/v1/__test__/reset");
});

describe("Queue API", () => {
  it("POST /v1/triage crea ticket y GET /v1/queue lo lista", async () => {
    const res1 = await api().post("/v1/triage").send({
      patientId: "p100",
      sintomas: "fiebre",
      urgencia: 2,
    });
    expect(res1.status).toBe(201);
    expect(res1.body.ticket).toHaveProperty("id");

    const res2 = await api().get("/v1/queue");
    expect(res2.status).toBe(200);
    expect(res2.body.size).toBe(1);
    expect(res2.body.items[0].patientId).toBe("p100");
  });

  it("prioriza por urgencia y FIFO; /queue/next atiende el correcto", async () => {
    await api().post("/v1/triage").send({ patientId: "p1", sintomas: "x", urgencia: 3 });
    await api().post("/v1/triage").send({ patientId: "p2", sintomas: "y", urgencia: 1 });
    await api().post("/v1/triage").send({ patientId: "p3", sintomas: "z", urgencia: 1 });

    const n1 = await api().post("/v1/queue/next");
    const n2 = await api().post("/v1/queue/next");
    const n3 = await api().post("/v1/queue/next");

    expect([n1.body.ticket.patientId, n2.body.ticket.patientId, n3.body.ticket.patientId])
      .toEqual(["p2", "p3", "p1"]);
  });

  it("PATCH /v1/queue/:id/urgency reprioriza correctamente", async () => {
    const r = await api().post("/v1/triage").send({ patientId: "pa", sintomas: "leve", urgencia: 3 });
    const id = r.body.ticket.id;

    await api().post("/v1/triage").send({ patientId: "pc", sintomas: "alta", urgencia: 1 });

    const up = await api().patch(`/v1/queue/${id}/urgency`).send({ urgencia: 1 });
    expect(up.status).toBe(200);
    expect(up.body.ok).toBe(true);

    const n1 = await api().post("/v1/queue/next");
    const n2 = await api().post("/v1/queue/next");

    expect([n1.body.ticket.patientId, n2.body.ticket.patientId]).toEqual(["pc", "pa"]);
  });

  it("POST /v1/queue/next sin elementos responde 204", async () => {
    const res = await api().post("/v1/__test__/reset"); // aseguramos vacío
    expect(res.status).toBe(200);

    const n = await api().post("/v1/queue/next");
    expect(n.status).toBe(204);
  });

  it("PATCH /v1/queue/:id/urgency 404 si no existe", async () => {
    const res = await api().patch("/v1/queue/nope/urgency").send({ urgencia: 1 });
    expect(res.status).toBe(404);
  });
});

