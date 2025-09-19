// tests/integration/auth.e2e.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/infrastructure/http/app.js";

process.env.NODE_ENV = "test";
const base = request(app);

describe("Auth E2E", () => {
  it("login (modo test) entrega tokens", async () => {
    const res = await base
      .post("/v1/auth/login")
      .send({ email: "user@example.com", password: "12345678" }); // 👈 email válido

    // Si quieres depurar, descomenta:
    // console.log("LOGIN", res.status, res.body);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });

  it("protected (complete) requiere token con rol", async () => {
    const login = await base
      .post("/v1/auth/login")
      .send({ email: "user@example.com", password: "12345678" });

    const token = login.body.accessToken as string;

    const res = await base
      .post("/v1/queue/complete/any-id")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect([200, 404]).toContain(res.status);
  });
});

