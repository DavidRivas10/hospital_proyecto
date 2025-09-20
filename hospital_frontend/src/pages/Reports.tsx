import { useEffect, useState } from "react";
import { Title, Text, Paper, Tabs, Group, Select, Button, Grid } from "@mantine/core";
import AppShell from "../components/AppShell";
import DateRange, { type DateRange as DateRangeValue } from "../components/DateRange";
import { getTriageReport, getAttendedReport } from "../api/reports";

export default function Reports() {
  const [tab, setTab] = useState<"triage" | "attended">("triage");

  // ⬅️ usa el tipo que exporta tu componente DateRange
  const [range, setRange] = useState<DateRangeValue>({});

  const [urgency, setUrgency] = useState<string | null>(null);
  const [triage, setTriage] = useState<{ total: number; byUrgency: Record<string, number> } | null>(null);
  const [attended, setAttended] = useState<{ total: number; byUrgency: Record<string, number> } | null>(null);

  function toIso(v: unknown): string | undefined {
    if (!v) return undefined;
    if (v instanceof Date) return v.toISOString();
    if (typeof v === "string") return v;
    return undefined;
  }

  async function load() {
    // soporta from/to o start/end por compatibilidad
    const r: any = range;
    const from = toIso(r.from ?? r.start);
    const to = toIso(r.to ?? r.end);

    const paramsBase = { from, to };
    const tri = await getTriageReport({ ...paramsBase, urgency: urgency ? Number(urgency) : undefined });
    const att = await getAttendedReport(paramsBase);
    setTriage({ total: tri.total, byUrgency: tri.byUrgency });
    setAttended({ total: att.total, byUrgency: att.byUrgency });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell>
      <Title order={2}>Reportes</Title>
      <Text c="dimmed" mb="md">Métricas basadas en registros</Text>

      <Group mb="md">
        <DateRange value={range} onChange={setRange} />
        <Select
          data={["1", "2", "3", "4", "5"]}
          value={urgency}
          onChange={setUrgency}
          placeholder="Urgencia (Triage)"
          clearable
        />
        <Button onClick={load}>Aplicar</Button>
      </Group>

      <Tabs value={tab} onChange={(v) => setTab((v as any) ?? "triage")}>
        <Tabs.List>
          <Tabs.Tab value="triage">Triage</Tabs.Tab>
          <Tabs.Tab value="attended">Atenciones</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="triage" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper withBorder p="md">
                <Text size="sm" c="dimmed">Total triage</Text>
                <Title order={3}>{triage?.total ?? "—"}</Title>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <Paper withBorder p="md">
                <Text size="sm" c="dimmed" mb="xs">Por urgencia</Text>
                <pre style={{ margin: 0 }}>{JSON.stringify(triage?.byUrgency ?? {}, null, 2)}</pre>
              </Paper>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="attended" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper withBorder p="md">
                <Text size="sm" c="dimmed">Total atendidos</Text>
                <Title order={3}>{attended?.total ?? "—"}</Title>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <Paper withBorder p="md">
                <Text size="sm" c="dimmed" mb="xs">Por urgencia</Text>
                <pre style={{ margin: 0 }}>{JSON.stringify(attended?.byUrgency ?? {}, null, 2)}</pre>
              </Paper>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}
