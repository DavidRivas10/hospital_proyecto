import { useEffect, useState } from "react";
import { Title, Text, Paper, Tabs, Group, Select, Button, Grid, Table } from "@mantine/core";
import AppShell from "../components/AppShell";
import DateRange, { type DateRange as DateRangeValue } from "../components/DateRange";
import { getTriageReport, getAttendedReport } from "../api/reports";

function ByUrgencyTable({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data || {}).sort(([a], [b]) => Number(a) - Number(b));
  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Urgencia</Table.Th>
          <Table.Th>Cantidad</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {entries.map(([u, n]) => (
          <Table.Tr key={u}>
            <Table.Td>{u}</Table.Td>
            <Table.Td>{n}</Table.Td>
          </Table.Tr>
        ))}
        {entries.length === 0 && (
          <Table.Tr><Table.Td colSpan={2}><Text c="dimmed">Sin datos</Text></Table.Td></Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}

export default function Reports() {
  const [tab, setTab] = useState<"triage" | "attended">("triage");
  const [range, setRange] = useState<DateRangeValue>({});
  const [urgency, setUrgency] = useState<string | null>(null);
  const [triage, setTriage] = useState<{ total: number; byUrgency: Record<string, number> } | null>(null);
  const [attended, setAttended] = useState<{ total: number; byUrgency: Record<string, number> } | null>(null);

  async function load() {
    // DateRange entrega yyyy-MM-dd; el backend acepta eso (new Date(...))
    const paramsBase = { from: range.from, to: range.to };
    const tri = await getTriageReport({ ...paramsBase, urgency: urgency ? Number(urgency) : undefined });
    const att = await getAttendedReport(paramsBase);
    setTriage({ total: tri.total, byUrgency: tri.byUrgency });
    setAttended({ total: att.total, byUrgency: att.byUrgency });
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

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
                <ByUrgencyTable data={triage?.byUrgency ?? {}} />
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
                <ByUrgencyTable data={attended?.byUrgency ?? {}} />
              </Paper>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}
