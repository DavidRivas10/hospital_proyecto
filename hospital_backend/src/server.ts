// src/server.ts (fragmento relevante)
import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import historyRouter from "./routes/history.js";

const app = express();

app.use(cors({
  origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
  credentials: false,
}));
app.use(express.json());

// otras rutas...
app.use("/v1/history", historyRouter);

// socket.io
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173" },
});

// emitir eventos cuando corresponda (ejemplo):
// io.emit("history:new", { type: "triage_created", patientId: "p123", createdAt: new Date().toISOString() });

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
