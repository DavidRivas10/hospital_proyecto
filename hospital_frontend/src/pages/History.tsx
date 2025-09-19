// src/pages/History.tsx
import { useEffect, useMemo, useState } from "react";
import { Title, Text, Table, Paper, Loader, Stack } from "@mantine/core";
import AppShell from "../components/AppShell";
import { getHistory } from "../api/history";
import { io, Socket } from "socket.io-client";

type HistoryEvent = {
  _id?: string;
  type?: string;        // e.g., "triage_created" | "queue_completed" ...
  patientId?: string;
  createdAt?: string;
  [k: string]: any;
};

export default function History() {
  const [items, setItems] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // URL socket desde env, fallback a localhost
  const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:4000";

  // socket singleton por página
  const socket: Socket = useMemo(
    () =>
      io(WS_URL, {
        transports: ["websocket"],
        autoConnect: true,
        // withCredentials: false
      }),
    [WS_URL]
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const data = await getHistory(500);
      if (!mounted) return;
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    }

    load();

    // listeners
    socket.on("connect", () => {
      // opcional: console.debug("socket connected", socket.id);
    });
    socket.on("history:new", (ev: HistoryEvent) => {
      // prepend nuevo evento
      setItems((prev) => [ev, ...prev]);
    });

    // cleanup: evitar socket.disconnect() en dev (StrictMode duplicaría efectos)
    return () => {
      mounted = false;
      socket.removeAllListeners();
      // Si quieres desconectar SOLO en producción:
      // if (socket.connected && import.meta.env.PROD) socket.disconnect();
    };
  }, [socket]);

  return (
    <AppShell>
      <Title order={2}>Historial</Title>
      <Text c="dimmed" mb="md">Actividad reciente del sistema</Text>

      {loading ? (
        <Stack align="center" mt="md"><Loader /></Stack>
      ) : (
        <Paper withBorder p="sm">
          <Table striped highlightOnHover stickyHeader stickyHeaderOffset={60}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Fecha</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Paciente</Table.Th>
                <Table.Th>Detalle</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((it, idx) => (
                <Table.Tr key={it._id ?? idx}>
                  <Table.Td>{it.createdAt ? new Date(it.createdAt).toLocaleString() : "—"}</Table.Td>
                  <Table.Td>{it.type ?? "—"}</Table.Td>
                  <Table.Td>{it.patientId ?? "—"}</Table.Td>
                  <Table.Td>{JSON.stringify(it)}</Table.Td>
                </Table.Tr>
              ))}
              {items.length === 0 && (
                <Table.Tr><Table.Td colSpan={4}><Text c="dimmed">Sin eventos por ahora.</Text></Table.Td></Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </AppShell>
  );
}


