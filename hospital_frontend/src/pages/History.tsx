// src/pages/History.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Title,
  Text,
  Table,
  Paper,
  Loader,
  Stack,
  Group,
  Button,
  Modal,
  Code,
  Badge,
  List,
} from "@mantine/core";
import AppShell from "../components/AppShell";
import { getHistory } from "../api/history";
import { io, Socket } from "socket.io-client";

type HistoryEvent = {
  _id?: string;
  type?: string; // "TRIAGE_CREATED" | "QUEUE_COMPLETED" | ...
  patientId?: string;
  createdAt?: string;
  at?: string | number;
  ticket?: { id?: string; urgencia?: number; arrivalSeq?: number; sintomas?: string };
  attended?: { id?: string; urgencia?: number; waitedMs?: number };
  [k: string]: any;
};

export default function History() {
  const [items, setItems] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<HistoryEvent | null>(null);
  const [showJson, setShowJson] = useState(false);

  const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:4000";
  const socket: Socket = useMemo(
    () => io(WS_URL, { transports: ["websocket"], autoConnect: true }),
    [WS_URL]
  );

  async function resetHistory() {
    if (!confirm("¿Seguro que deseas limpiar el historial? Esta acción no se puede deshacer.")) return;
    await fetch("/v1/history/reset", { method: "POST" });
    setItems([]);
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const raw = (await getHistory(500)) as unknown;
      const arr: HistoryEvent[] = Array.isArray(raw)
        ? (raw as HistoryEvent[])
        : ((raw as { items?: HistoryEvent[] })?.items ?? []);
      if (!mounted) return;
      setItems(arr);
      setLoading(false);
    }

    load();

    socket.on("history:new", (ev: HistoryEvent) => {
      setItems((prev) => [ev, ...prev]);
    });

    return () => {
      mounted = false;
      socket.removeAllListeners();
    };
  }, [socket]);

  function formatDate(it: HistoryEvent) {
    const ts = it.createdAt ?? it.at;
    return ts ? new Date(ts).toLocaleString() : "—";
  }

  function shortId(id?: string) {
    if (!id) return "—";
    return id.length > 8 ? `${id.slice(0, 8)}…` : id;
  }

  function humanDetail(it: HistoryEvent) {
    if (it.type === "TRIAGE_CREATED") {
      const id = shortId(it.ticket?.id);
      const u = it.ticket?.urgencia ?? "—";
      return (
        <>
          Ticket <Badge variant="light">{id}</Badge> (urgencia {u})
        </>
      );
    }
    if (it.type === "QUEUE_COMPLETED" || it.type?.toUpperCase() === "ATTENDED") {
      const id = shortId(it.attended?.id ?? it.ticket?.id);
      const u = it.attended?.urgencia ?? it.ticket?.urgencia ?? "—";
      const waited = it.attended?.waitedMs
        ? `, espera ${Math.round((it.attended.waitedMs as number) / 60000)}m`
        : "";
      return (
        <>
          Atendido <Badge variant="light">{id}</Badge> (urgencia {u}{waited})
        </>
      );
    }
    return <>{it.type ?? "Evento"}</>;
  }

  const rows = items.map((it, idx) => (
    <Table.Tr key={it._id ?? idx}>
      <Table.Td>{formatDate(it)}</Table.Td>
      <Table.Td>{it.type ?? "—"}</Table.Td>
      <Table.Td>{it.patientId ?? "—"}</Table.Td>
      <Table.Td>
        <Group gap="xs" justify="space-between">
          <Text size="sm">{humanDetail(it)}</Text>
          <Button
            size="xs"
            variant="light"
            onClick={() => {
              setSelected(it);
              setShowJson(false);
              setOpened(true);
            }}
          >
            Ver
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <AppShell>
      <Group justify="space-between" align="center" mb="xs">
        <div>
          <Title order={2}>Historial</Title>
          <Text c="dimmed">Actividad reciente del sistema</Text>
        </div>
        <Button variant="light" color="red" onClick={resetHistory}>
          Resetear historial
        </Button>
      </Group>

      {loading ? (
        <Stack align="center" mt="md">
          <Loader />
        </Stack>
      ) : (
        <Paper withBorder p="sm" radius="md">
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
              {rows}
              {items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed">Sin eventos por ahora.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      <Modal opened={opened} onClose={() => setOpened(false)} title="Detalle del evento" size="lg">
        {!selected ? (
          <Text c="dimmed">—</Text>
        ) : (
          <>
            {/* Resumen legible */}
            <List spacing="xs" mb="sm">
              <List.Item><b>Fecha:</b> {formatDate(selected)}</List.Item>
              <List.Item><b>Tipo:</b> {selected.type ?? "—"}</List.Item>
              <List.Item><b>Paciente:</b> {selected.patientId ?? "—"}</List.Item>

              {selected.ticket?.id && (
                <List.Item><b>Ticket:</b> {selected.ticket.id}</List.Item>
              )}
              {(selected.ticket?.urgencia ?? selected.attended?.urgencia) && (
                <List.Item><b>Urgencia:</b> {selected.attended?.urgencia ?? selected.ticket?.urgencia}</List.Item>
              )}
              {typeof selected.attended?.waitedMs === "number" && (
                <List.Item>
                  <b>Espera:</b> {Math.round((selected.attended.waitedMs as number) / 60000)} min
                </List.Item>
              )}
              {selected.ticket?.sintomas && (
                <List.Item><b>Síntomas:</b> {selected.ticket.sintomas}</List.Item>
              )}
            </List>

            <Group justify="space-between" mb="xs">
              <Text c="dimmed" size="sm">
                {showJson ? "JSON completo del evento" : "Resumen legible"}
              </Text>
              <Button size="xs" variant="light" onClick={() => setShowJson((v) => !v)}>
                {showJson ? "Ocultar JSON" : "Ver JSON"}
              </Button>
            </Group>

            {showJson && (
              <Code block style={{ maxHeight: 420, overflow: "auto" }}>
                {JSON.stringify(selected, null, 2)}
              </Code>
            )}
          </>
        )}
      </Modal>
    </AppShell>
  );
}
