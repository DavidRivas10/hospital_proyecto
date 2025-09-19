import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader, { AppBreadcrumbs } from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { SimpleGrid } from "@mantine/core";
import { getQueueMetrics } from "../api/queue";
import { IconActivityHeartbeat as Activity, IconHourglass as Hourglass, IconCircleCheck as CheckCircle2 } from "@tabler/icons-react";

export default function Dashboard() {
  const [inQueue, setInQueue] = useState<number>(0);
  const [completedToday, setCompletedToday] = useState<number>(0);
  const [avgTime, setAvgTime] = useState<string>("—");

  async function loadMetrics() {
    try {
      const m = await getQueueMetrics();
      setInQueue(m.pendingCount);
      setCompletedToday(m.todayCompleted);
      setAvgTime(m.avgMinutes != null ? `${m.avgMinutes}m` : "—");
    } catch {
      setInQueue(0); setCompletedToday(0); setAvgTime("—");
    }
  }

  useEffect(() => {
    loadMetrics();
    const t = setInterval(loadMetrics, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onFocus = () => {
      if (sessionStorage.getItem("queue:changed")) {
        sessionStorage.removeItem("queue:changed");
        loadMetrics();
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <AppShell>
      <AppBreadcrumbs items={["Inicio"]} />
      <PageHeader title="Dashboard" subtitle="Visión general del día" />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        <StatCard label="En cola" value={inQueue} icon={<Activity size={18} />} />
        <StatCard label="Atendidos hoy" value={completedToday} icon={<CheckCircle2 size={18} />} />
        <StatCard label="Tiempo medio" value={avgTime} icon={<Hourglass size={18} />} />
      </SimpleGrid>
    </AppShell>
  );
}
