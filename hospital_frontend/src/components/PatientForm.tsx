import { useEffect, useState } from "react";
import { TextInput, Select, Textarea, Button, Group, Grid, Card, Text, Divider } from "@mantine/core";

export type PatientFormValues = {
  fullName: string;
  birthDate?: string;
  sex?: "M" | "F" | "O";
  phone?: string;
  email?: string;
  address?: string;
  allergies?: string[];
  chronicConditions?: string[];
  symptoms?: string;
  urgency?: number; // 1..5
};

function isoToYmd(iso?: string): string {
  if (!iso) return "";
  try { return new Date(iso).toISOString().slice(0, 10); } catch { return ""; }
}

export default function PatientForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: any;
  submitting?: boolean;
  onSubmit: (v: PatientFormValues) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<PatientFormValues>({
    fullName: "",
    birthDate: "",
    sex: "O",
    phone: "",
    email: "",
    address: "",
    allergies: [],
    chronicConditions: [],
    symptoms: "",
    urgency: 3,
  });

  const [allergyText, setAllergyText] = useState("");
  const [chronicText, setChronicText] = useState("");

  useEffect(() => {
    if (initial) {
      setValues((v) => ({
        ...v,
        fullName: initial.fullName ?? "",
        birthDate: isoToYmd(initial.birthDate),
        sex: (initial.sex as any) ?? "O",
        phone: initial.phone ?? "",
        email: initial.email ?? "",
        address: initial.address ?? "",
        allergies: initial.allergies ?? [],
        chronicConditions: initial.chronicConditions ?? [],
        symptoms: initial.symptoms ?? "",
        urgency: initial.urgency ?? 3,
      }));
      setAllergyText((initial.allergies ?? []).join(", "));
      setChronicText((initial.chronicConditions ?? []).join(", "));
    }
  }, [initial]);

  // ✅ handler tolerante (evita "currentTarget is null")
  function handleChange(e: any) {
    const name = e?.target?.name ?? e?.currentTarget?.name;
    const value = e?.target?.value ?? e?.currentTarget?.value ?? "";
    if (!name) return;
    setValues((v) => ({ ...v, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allergies = allergyText.split(",").map(s => s.trim()).filter(Boolean);
    const chronicConditions = chronicText.split(",").map(s => s.trim()).filter(Boolean);

    onSubmit({
      ...values,
      allergies,
      chronicConditions,
      birthDate: values.birthDate || undefined,
      sex: values.sex || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
      urgency: Number(values.urgency) as any,
    });
  }

  const todayYmd = new Date().toISOString().slice(0, 10);

  return (
    <Card withBorder radius="md" p="lg" shadow="sm">
      <Text fw={600} mb="xs">Nuevo paciente</Text>
      <Text c="dimmed" size="sm" mb="md">
        Completa los datos del paciente y una breve descripción de los síntomas.
      </Text>
      <Divider mb="md" />

      <form onSubmit={handleSubmit}>
        <Grid gutter="md">
          {/* Identificación */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Nombre completo"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              required
              placeholder="Ej: Ana Pérez"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Teléfono"
              name="phone"
              value={values.phone ?? ""}
              onChange={handleChange}
              placeholder="Ej: 96806012"
              pattern="^[0-9]{8}$"
              title="Ingresa exactamente 8 dígitos"
            />
          </Grid.Col>

          {/* Datos demográficos */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              type="date"
              label="Fecha de nacimiento"
              name="birthDate"
              value={values.birthDate ?? ""}
              onChange={handleChange}
              max={todayYmd}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Sexo"
              value={values.sex ?? "O"}
              onChange={(v) => setValues((s) => ({ ...s, sex: (v as any) ?? "O" }))}
              data={[
                { value: "M", label: "M" },
                { value: "F", label: "F" },
                { value: "O", label: "O" },
              ]}
              placeholder="Selecciona"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Email"
              type="email"
              name="email"
              value={values.email ?? ""}
              onChange={handleChange}
              placeholder="correo@dominio.com"
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="Dirección"
              name="address"
              value={values.address ?? ""}
              onChange={handleChange}
              placeholder="Calle, número, ciudad"
            />
          </Grid.Col>

          {/* Salud */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Textarea
              label="Alergias (separadas por coma)"
              value={allergyText}
              onChange={(e) => setAllergyText((e.target as HTMLTextAreaElement).value)}
              placeholder="penicilina, polen"
              autosize
              minRows={1}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Textarea
              label="Condiciones crónicas (separadas por coma)"
              value={chronicText}
              onChange={(e) => setChronicText((e.target as HTMLTextAreaElement).value)}
              placeholder="asma, hipertensión"
              autosize
              minRows={1}
            />
          </Grid.Col>

          {/* Motivo de consulta */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Textarea
              label="Síntomas"
              name="symptoms"
              value={values.symptoms ?? ""}
              onChange={(e) =>
                setValues((s) => ({ ...s, symptoms: (e.target as HTMLTextAreaElement).value }))
              }
              placeholder="Describa brevemente los síntomas"
              autosize
              minRows={2}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Urgencia"
              value={String(values.urgency ?? 3)}
              onChange={(v) => setValues((s) => ({ ...s, urgency: v ? Number(v) : 3 }))}
              data={[
                { value: "1", label: "1 (crítica)" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
                { value: "5", label: "5 (baja)" },
              ]}
              placeholder="Selecciona"
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Group justify="flex-start" gap="sm" mt="xs">
              <Button type="submit" loading={submitting}>
                Guardar
              </Button>
              {onCancel && (
                <Button variant="light" onClick={onCancel} disabled={submitting}>
                  Cancelar
                </Button>
              )}
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </Card>
  );
}
