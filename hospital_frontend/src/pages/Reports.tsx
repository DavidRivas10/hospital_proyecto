// src/pages/Reports.tsx
import { useEffect, useState } from "react";
import { Title, Text, Paper } from "@mantine/core";
import AppShell from "../components/AppShell";
import { getHistory } from "../api/history";

type HistoryEvent = {
  _id?: string;
  type?: string;
  patientId?: string;
  createdAt?: string;
  [k: string]: any;
};

export default function Reports() {
  const [items, setItems] = useState<HistoryEvent[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getHistory(1000);
      setItems(Array.isArray(data) ? data : []);
    })();
  }, []);

  // ejemplo simple: conteo por tipo
  const countsByType = items.reduce<Record<string, number>>((acc, it) => {
    const k = it.type ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell>
      <Title order={2}>Reportes</Title>
      <Text c="dimmed" mb="md">Métricas basadas en el historial</Text>

      <Paper withBorder p="md">
        <pre style={{ margin: 0 }}>{JSON.stringify(countsByType, null, 2)}</pre>
      </Paper>
    </AppShell>
  );
}
