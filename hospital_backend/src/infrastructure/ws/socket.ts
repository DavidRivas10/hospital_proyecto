import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server | undefined;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  io.on("connection", (socket) => {
    socket.emit("hello", { ok: true });
  });
}

export function wsEmit(event: string, payload: any) {
  if (!io) return;
  io.emit(event, payload);
}

export function getIO() {
  return io;
}

