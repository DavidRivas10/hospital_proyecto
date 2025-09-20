// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader, { AppBreadcrumbs } from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { SimpleGrid, Table, Paper, Group, Button, Text } from "@mantine/core";
import {
  getQueue,
  nextTicket,
  getLocalCreatedAt,
  clearLocalCreatedAt,
  type Ticket,
} from "../api/queue";
import {
  IconActivityHeartbeat as Activity,
  IconHourglass as Hourglass,
  IconCircleCheck as CheckCircle2,
} from "@tabler/icons-react";

// util simple para mostrar mm:ss
function fmtMs(ms: number | null) {
  if (ms == null || !isFinite(ms)) return "—";
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

type RowState = "idle" | "attending";

export default function Dashboard() {
  const [items, setItems] = useState<Ticket[]>([]);
  const [inQueue, setInQueue] = useState(0);

  // métricas locales (para no depender aún del backend)
  const [attendedDurations, setAttendedDurations] = useState<number[]>([]);
  const completedToday = attendedDurations.length;
  const avgTime =
    completedToday === 0
      ? "—"
      : `${Math.max(
          1,
          Math.round(
            attendedDurations.reduce((a, b) => a + b, 0) / completedToday / 60000
          )
        )}m`;

  // estado visual “Atendiendo…” por fila
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});

  async function loadQueue() {
    try {
      const { size, items } = await getQueue();
      setItems(items);
      setInQueue(size);
    } catch {
      setItems([]);
      setInQueue(0);
    }
  }

  useEffect(() => {
    loadQueue();
    const t = setInterval(loadQueue, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onFocus = () => {
      if (sessionStorage.getItem("queue:changed")) {
        sessionStorage.removeItem("queue:changed");
        loadQueue();
      } else {
        loadQueue();
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Calcular espera por fila (según timestamps guardados al crear el ticket)
  const now = Date.now();
  const rows = useMemo(
    () =>
      items.map((t) => {
        const createdAt = getLocalCreatedAt(t.id);
        const wait = createdAt ? now - createdAt : null;
        return { ...t, waitMs: wait };
      }),
    [items, now]
  );

  // Marca fila como “Atendiendo…”
  function markAttending(id: string) {
    setRowStates((s) => ({ ...s, [id]: "attending" }));
  }

  // Alta: respeta la prioridad llamando a /queue/next en el backend
  async function handleAltaPrimero() {
    if (items.length === 0) return;

    const served = await nextTicket(); // backend saca el siguiente por prioridad
    if (!served) {
      // no había elementos
      setItems([]);
      setInQueue(0);
      return;
    }

    // calcula duración local si se creó desde este navegador
    const createdAt = getLocalCreatedAt(served.id);
    if (createdAt) {
      const dur = Date.now() - createdAt;
      setAttendedDurations((arr) => [...arr, dur]);
    }
    clearLocalCreatedAt(served.id);

    // refresca tabla/cifras locales
    setItems((prev) => prev.filter((x) => x.id !== served.id));
    setInQueue((n) => Math.max(0, n - 1));
  }

  return (
    <AppShell>
      <AppBreadcrumbs items={["Inicio"]} />
      <PageHeader title="Dashboard" subtitle="Visión general del día" />

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        <StatCard label="En cola" value={inQueue} icon={<Activity size={18} />} />
        <StatCard
          label="Atendidos hoy"
          value={completedToday}
          icon={<CheckCircle2 size={18} />}
        />
        <StatCard
          label="Tiempo medio"
          value={avgTime}
          icon={<Hourglass size={18} />}
        />
      </SimpleGrid>

      <Paper withBorder radius="md" p="md" mt="lg">
        <Group justify="space-between" mb="sm">
          <Text fw={600}>En cola</Text>
          <Button
            size="xs"
            onClick={handleAltaPrimero}
            disabled={items.length === 0}
          >
            Alta (siguiente)
          </Button>
        </Group>

        <Table highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ticket</Table.Th>
              <Table.Th>Paciente</Table.Th>
              <Table.Th>Urgencia</Table.Th>
              <Table.Th>Espera</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center">
                    Sin pacientes en cola
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows.map((t, idx) => {
                const isFirst = idx === 0;
                const isAttending = rowStates[t.id] === "attending";
                return (
                  <Table.Tr key={t.id}>
                    <Table.Td>
                      <code>{t.id.slice(0, 8)}</code>
                    </Table.Td>
                    <Table.Td>{t.patientId}</Table.Td>
                    <Table.Td>{`U${t.urgencia}`}</Table.Td>
                    <Table.Td>{fmtMs(t.waitMs)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant={isAttending ? "filled" : "light"}
                          color={isAttending ? "yellow" : "blue"}
                          onClick={() => markAttending(t.id)}
                        >
                          {isAttending ? "Atendiendo…" : "Atender"}
                        </Button>
                        <Button
                          size="xs"
                          variant="light"
                          color="teal"
                          disabled={!isFirst}
                          onClick={handleAltaPrimero}
                        >
                          Alta
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </AppShell>
  );
}
