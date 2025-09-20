import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { Title, Grid, Paper, Button, Text, Accordion, Group, Badge } from "@mantine/core";
import PatientForm, { type PatientFormValues } from "../components/PatientForm";
import { createPatient, listPatients, type Patient } from "../api/patients";
import { triageCreate, attendTicket } from "../api/queue";

type PatientRow = Patient & { activeTicketId?: string; activeUrgency?: number };

export default function PatientsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<PatientRow[]>([]);

  async function load() {
    const list = await listPatients();
    // si luego expones ticket activo del paciente desde backend, mapeas aquí
    setItems(list as PatientRow[]);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(v: PatientFormValues) {
    try {
      setSubmitting(true);
      await createPatient(v as any);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateTicket(p: PatientRow) {
    const r = await triageCreate({ patientId: p._id || p.id!, sintomas: "", urgencia: 3 });
    // guardamos “activo” localmente para mostrar botón de alta
    setItems((prev) =>
      prev.map(it =>
        it._id === p._id
          ? { ...it, activeTicketId: r.ticket.id, activeUrgency: r.ticket.urgencia }
          : it
      )
    );
  }

  async function handleAttend(p: PatientRow) {
    if (!p.activeTicketId) return;
    await attendTicket(p.activeTicketId);
    setItems((prev) =>
      prev.map(it =>
        it._id === p._id
          ? { ...it, activeTicketId: undefined, activeUrgency: undefined }
          : it
      )
    );
  }

  return (
    <AppShell>
      <Title order={2} mb="md">Pacientes</Title>
      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="md">
            <Text c="dimmed" size="sm" mb="xs">Nuevo paciente</Text>
            <PatientForm onSubmit={handleCreate} submitting={submitting} />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="md">
            <Text c="dimmed" size="sm" mb="sm">Listado</Text>

            <Accordion multiple>
              {items.map((p) => (
                <Accordion.Item key={p._id || p.id} value={String(p._id || p.id)}>
                  <Accordion.Control>
                    <Group justify="space-between" w="100%">
                      <Text fw={600}>{p.fullName}</Text>
                      <Group gap="xs">
                        {typeof p.activeUrgency === "number" && (
                          <Badge variant="light">Urgencia {p.activeUrgency}</Badge>
                        )}
                        {p.activeTicketId ? (
                          <Button
                            size="xs"
                            variant="light"
                            onClick={(e) => { e.stopPropagation(); handleAttend(p); }}
                          >
                            Dar de alta
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            onClick={(e) => { e.stopPropagation(); handleCreateTicket(p); }}
                          >
                            Crear ticket
                          </Button>
                        )}
                      </Group>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Text size="sm"><b>Documento:</b> {p.docId || "—"}</Text>
                    <Text size="sm"><b>Nacimiento:</b> {p.birthDate || "—"}</Text>
                    <Text size="sm"><b>Sexo:</b> {p.sex || "—"}</Text>
                    <Text size="sm"><b>Teléfono:</b> {p.phone || "—"}</Text>
                    <Text size="sm"><b>Email:</b> {p.email || "—"}</Text>
                    <Text size="sm"><b>Dirección:</b> {p.address || "—"}</Text>
                    <Text size="sm"><b>Alergias:</b> {(p.allergies || []).join(", ") || "—"}</Text>
                    <Text size="sm"><b>Cond. crónicas:</b> {(p.chronicConditions || []).join(", ") || "—"}</Text>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Paper>
        </Grid.Col>
      </Grid>
    </AppShell>
  );
}
