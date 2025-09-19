export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Hospital API",
    version: "1.0.0",
    description:
      "API de triaje hospitalario: tickets, pacientes, auth, reportes y tiempo real (WebSocket).",
  },
  servers: [{ url: "http://localhost:4000/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      TriageCreate: {
        type: "object",
        required: ["patientId", "sintomas", "urgencia"],
        properties: {
          patientId: { type: "string" },
          sintomas: { type: "string" },
          signosVitales: {
            type: "object",
            properties: {
              FC: { type: "number" },
              FR: { type: "number" },
              TA: { type: "string" },
              Temp: { type: "number" },
              SpO2: { type: "number" },
            },
          },
          urgencia: { type: "integer", enum: [1, 2, 3] },
        },
      },
      PatientCreate: {
        type: "object",
        required: ["docId", "fullName"],
        properties: {
          docId: { type: "string" },
          fullName: { type: "string" },
          birthDate: { type: "string", format: "date-time" },
          sex: { type: "string", enum: ["M", "F", "O"] },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          address: { type: "string" },
          allergies: { type: "array", items: { type: "string" } },
          chronicConditions: { type: "array", items: { type: "string" } },
        },
      },
      Login: {
        type: "object",
        required: ["email", "password"],
        properties: { email: { type: "string" }, password: { type: "string" } },
      },
      Register: {
        type: "object",
        required: ["email", "password", "fullName"],
        properties: {
          email: { type: "string" },
          password: { type: "string" },
          fullName: { type: "string" },
          roles: { type: "array", items: { type: "string" } },
        },
      },
      Reprioritize: {
        type: "object",
        required: ["urgencia"],
        properties: { urgencia: { type: "integer", enum: [1, 2, 3] } },
      },
    },
  },
  paths: {
    "/": { get: { summary: "Ping API", responses: { 200: { description: "OK" } } } },

    // Auth
    "/auth/register": {
      post: {
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Register" } } },
        },
        responses: { 201: { description: "User created" }, 409: { description: "Email in use" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Login" } } },
        },
        responses: { 200: { description: "Tokens" }, 401: { description: "Invalid credentials" } },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } },
            },
          },
        },
        responses: { 200: { description: "New access token" }, 401: { description: "Invalid refresh" } },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } },
            },
          },
        },
        responses: { 200: { description: "Logged out" } },
      },
    },

    // Queue
    "/triage": {
      post: {
        tags: ["Queue"],
        summary: "Crear ticket de triaje (aplica reglas)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TriageCreate" } } },
        },
        responses: { 201: { description: "Ticket creado" } },
      },
    },
    "/queue": { get: { tags: ["Queue"], summary: "Listar cola", responses: { 200: { description: "OK" } } } },
    "/queue/next": { post: { tags: ["Queue"], summary: "Atender siguiente", responses: { 200: { description: "OK" }, 204: { description: "Vacía" } } } },
    "/queue/complete/{id}": {
      post: {
        tags: ["Queue"],
        summary: "Completar atención (done)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", schema: { type: "string" }, required: true }],
        responses: { 200: { description: "OK" }, 403: { description: "Forbidden" } },
      },
    },
    "/queue/{id}/urgency": {
      patch: {
        tags: ["Queue"],
        summary: "Repriorizar ticket",
        parameters: [{ in: "path", name: "id", schema: { type: "string" }, required: true }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Reprioritize" } } },
        },
        responses: { 200: { description: "OK" } },
      },
    },

    // Patients
    "/patients": {
      post: {
        tags: ["Patients"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PatientCreate" } } },
        },
        responses: { 201: { description: "Created" } },
      },
      get: {
        tags: ["Patients"],
        summary: "Buscar por nombre (?q=)",
        parameters: [{ in: "query", name: "q", schema: { type: "string" } }],
        responses: { 200: { description: "OK" } },
      },
    },
    "/patients/{id}": {
      get: {
        tags: ["Patients"],
        parameters: [{ in: "path", name: "id", schema: { type: "string" }, required: true }],
        responses: { 200: { description: "OK" }, 404: { description: "Not Found" } },
      },
      patch: {
        tags: ["Patients"],
        parameters: [{ in: "path", name: "id", schema: { type: "string" }, required: true }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PatientCreate" } } },
        },
        responses: { 200: { description: "OK" }, 404: { description: "Not Found" } },
      },
    },

    // Reports
    "/reports/summary": {
      get: {
        tags: ["Reports"],
        parameters: [{ in: "query", name: "since", schema: { type: "string", format: "date-time" } }],
        responses: { 200: { description: "OK" } },
      },
    },
  },
};
