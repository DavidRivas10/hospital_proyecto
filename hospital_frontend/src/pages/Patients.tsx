// src/pages/Patients.tsx
import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import {
  Title,
  Paper,
  Button,
  Text,
  Group,
  Badge,
  Table,
  Stack,
} from "@mantine/core";
import PatientForm, { type PatientFormValues } from "../components/PatientForm";
import { triageCreate, attendTicket } from "../api/queue";

type PatientRow = {
  id: string;            // id local (no backend)
  fullName: string;
  birthDate?: string;
  sex?: "M" | "F" | "O";
  phone?: string;
  email?: string;
  address?: string;
  allergies?: string[];
  chronicConditions?: string[];
  activeTicketId?: string;
  activeUrgency?: number;
};

function genPatientId() {
  return `H-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export default function PatientsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<PatientRow[]>([]);

  useEffect(() => {
    setItems([]);
  }, []);

  async function handleCreate(v: PatientFormValues) {
    try {
      setSubmitting(true);

      const id = genPatientId();
      const patient: PatientRow = {
        id,
        fullName: v.fullName,
        birthDate: v.birthDate,
        sex: (v.sex as any) ?? "O",
        phone: v.phone,
        email: v.email,
        address: v.address,
        allergies: v.allergies ?? [],
        chronicConditions: v.chronicConditions ?? [],
      };

      const urg = v.urgency ?? 3;
      const r = await triageCreate({
        patientId: id,
        sintomas: v.symptoms ?? "",
        urgencia: urg,
      });

      setItems((prev) => [
        {
          ...patient,
          activeTicketId: r.ticket.id,
          activeUrgency: r.ticket.urgencia,
        },
        ...prev,
      ]);
    } catch (err: any) {
      const server = err?.response?.data?.error;
      const msg =
        server?.message ||
        server?.code ||
        (Array.isArray(server?.issues) && server.issues.length
          ? server.issues[0].message || JSON.stringify(server.issues[0])
          : "") ||
        err?.message ||
        "ERROR";
      console.log("[Patients] create error detail:", server);
      alert(`No se pudo registrar: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAttend(p: PatientRow) {
    if (!p.activeTicketId) return;
    await attendTicket(p.activeTicketId);
    setItems((prev) =>
      prev.map((it) =>
        it.id === p.id
          ? { ...it, activeTicketId: undefined, activeUrgency: undefined }
          : it
      )
    );
  }

  return (
    <AppShell>
      <Title order={2} mb="md">Pacientes</Title>

      <Stack gap="md">
        <Paper withBorder p="md" radius="md" shadow="xs">
          <Text c="dimmed" size="sm" mb="xs">Nuevo paciente</Text>
          <PatientForm onSubmit={handleCreate} submitting={submitting} />
        </Paper>

        <Paper withBorder p="md" radius="md" shadow="xs">
          <Group justify="space-between" mb="sm">
            <Text c="dimmed" size="sm">Listado</Text>
            <Badge variant="light">
              {items.length} {items.length === 1 ? "paciente" : "pacientes"}
            </Badge>
          </Group>

          {items.length === 0 ? (
            <Text c="dimmed">Sin pacientes aún</Text>
          ) : (
            <Table striped highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Contacto</Table.Th>
                  <Table.Th>Datos</Table.Th>
                  <Table.Th>Estado</Table.Th>
                  <Table.Th style={{ width: 140 }}>Acción</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td>
                      <Text fw={600}>{p.fullName}</Text>
                      <Text size="sm" c="dimmed">ID: {p.id}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{p.phone || "—"}</Text>
                      <Text size="sm" c="dimmed">{p.email || "—"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm"><b>Nac.:</b> {p.birthDate || "—"}</Text>
                      <Text size="sm"><b>Sexo:</b> {p.sex || "—"}</Text>
                    </Table.Td>
                    <Table.Td>
                      {p.activeTicketId ? (
                        <Badge variant="light">Urgencia {p.activeUrgency}</Badge>
                      ) : (
                        <Badge variant="light" color="gray">Sin ticket</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {p.activeTicketId ? (
                        <Button size="xs" variant="light" onClick={() => handleAttend(p)}>
                          Dar de alta
                        </Button>
                      ) : (
                        <Text size="sm" c="dimmed">—</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>
    </AppShell>
  );
}
