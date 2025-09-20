// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader, { AppBreadcrumbs } from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { SimpleGrid, Table, Paper, Group, Button, Text } from "@mantine/core";
import { getQueue, getQueueMetrics, nextTicket, getLocalCreatedAt, clearLocalCreatedAt } from "../api/queue";
import {
  IconActivityHeartbeat as Activity,
  IconHourglass as Hourglass,
  IconCircleCheck as CheckCircle2,
} from "@tabler/icons-react";

type Ticket = {
  id: string;
  patientId: string;
  urgencia: number;      // 1 más urgente
  arrivalSeq: number;
  sintomas?: string;
};

function fmtMs(ms: number | null) {
  if (ms == null || !isFinite(ms)) return "—";
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function Dashboard() {
  const [inQueue, setInQueue] = useState<number>(0);
  const [completedToday, setCompletedToday] = useState<number>(0);
  const [avgTime, setAvgTime] = useState<string>("—");

  const [items, setItems] = useState<Ticket[]>([]);
  const [attendedDurations, setAttendedDurations] = useState<number[]>([]); // ms locales

  async function loadAll() {
    // métricas “ligeras” (placeholder de today/avg) + listado real
    const [m, list] = await Promise.all([getQueueMetrics(), getQueue()]);
    setInQueue(m.pendingCount);
    setCompletedToday(m.todayCompleted);   // por ahora 0 (placeholder)
    setAvgTime(m.avgMinutes != null ? `${m.avgMinutes}m` : "—");
    setItems(Array.isArray(list?.items) ? list.items : []);
  }

  useEffect(() => {
    loadAll().catch(() => {
      setInQueue(0); setCompletedToday(0); setAvgTime("—"); setItems([]);
    });
    const t = setInterval(loadAll, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onFocus = () => {
      if (sessionStorage.getItem("queue:changed")) {
        sessionStorage.removeItem("queue:changed");
        loadAll().catch(() => {});
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // “Tiempo de espera” por fila usando hora local guardada al crear el ticket
  const now = useMemo(() => Date.now(), [items]); // recalcula al refrescar lista
  const rows = items.map((t) => {
    const createdAt = getLocalCreatedAt(t.id); // puede ser null si el ticket no se creó desde este navegador
    const wait = createdAt ? now - createdAt : null;
    return { ...t, waitMs: wait };
  });

  // promedio local de atenciones (duraciones que vamos acumulando con el botón “Atender siguiente”)
  const localAvg = useMemo(() => {
    if (attendedDurations.length === 0) return "—";
    const m = Math.round(attendedDurations.reduce((a, b) => a + b, 0) / attendedDurations.length);
    const min = Math.max(1, Math.round(m / 60000)); // al menos 1 min visual
    return `${min}m`;
  }, [attendedDurations]);

  async function handleNext() {
    const ticket = await nextTicket();
    if (!ticket) {
      // sin elementos
      setItems([]); setInQueue(0);
      return;
    }

    // quitarlo visualmente
    setItems((prev) => prev.filter((x) => x.id !== ticket.id));
    setInQueue((n) => Math.max(0, n - 1));

    // calcular y acumular duración local
    const createdAt = getLocalCreatedAt(ticket.id);
    if (createdAt) {
      const dur = Date.now() - createdAt;
      setAttendedDurations((arr) => [...arr, dur]);
    }
    clearLocalCreatedAt(ticket.id);
  }

  return (
    <AppShell>
      <AppBreadcrumbs items={["Inicio"]} />
      <PageHeader title="Dashboard" subtitle="Visión general del día" />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        <StatCard label="En cola" value={inQueue} icon={<Activity size={18} />} />
        <StatCard label="Atendidos hoy" value={completedToday} icon={<CheckCircle2 size={18} />} />
        <StatCard label="Tiempo medio" value={localAvg !== "—" ? localAvg : avgTime} icon={<Hourglass size={18} />} />
      </SimpleGrid>

      <Paper withBorder radius="md" p="md" mt="lg">
        <Group justify="space-between" mb="sm">
          <Text fw={600}>En cola</Text>
          <Button size="xs" onClick={handleNext}>Atender siguiente</Button>
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
                  <Text c="dimmed" ta="center">Sin pacientes en cola</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows.map((t) => (
                <Table.Tr key={t.id}>
                  <Table.Td>{t.id.slice(0, 8)}</Table.Td>
                  <Table.Td>{t.patientId}</Table.Td>
                  <Table.Td>U{t.urgencia}</Table.Td>
                  <Table.Td>{fmtMs(t.waitMs)}</Table.Td>
                  <Table.Td>
                    {/* Alta directa por fila: lo dejaremos para cuando expongamos DELETE /v1/queue/:id */}
                    <Button size="xs" variant="light" disabled>
                      Alta
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </AppShell>
  );
}
