// src/pages/TriageForm.tsx
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Select, TextInput, Textarea, Fieldset, Group, Title, Text, Grid } from "@mantine/core";
import AppShell from "../components/AppShell";
import { triageSchema, type TriageFormData } from "../validation/traige"; // o "../validation/triage" si ya lo renombraste
import { triageCreate } from "../api/queue";
import GlowCard from "../components/GlowCard";

export default function TriageForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TriageFormData>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      patientId: "",
      sintomas: "",
      urgencia: 3,
      signosVitales: { FC: "", FR: "", TA: "", Temp: "", SpO2: "" } as any,
    },
  });

  const onSubmit: SubmitHandler<TriageFormData> = async (values) => {
    await triageCreate(values as unknown as any);
    sessionStorage.setItem("queue:changed", Date.now().toString());
    reset({
      patientId: "",
      sintomas: "",
      urgencia: 3,
      signosVitales: { FC: "", FR: "", TA: "", Temp: "", SpO2: "" } as any,
    });
  };

  const urgencia = String(watch("urgencia") ?? 3);

  return (
    <GlowCard>
      <AppShell>
        <Title order={2}>Nuevo triaje</Title>
        <Text c="dimmed" mb="md">Crear ticket para la cola de atención</Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid gutter="sm">
            <Grid.Col span={12}>
              <TextInput
                label="Paciente (ID)"
                placeholder="p123"
                error={errors.patientId?.message}
                {...register("patientId")}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Urgencia"
                data={[
                  { value: "1", label: "U1 (crítica)" },
                  { value: "2", label: "U2 (urgente)" },
                  { value: "3", label: "U3 (normal)" },
                ]}
                value={urgencia}
                onChange={(v) => setValue("urgencia", Number(v ?? 3), { shouldValidate: true })}
                error={errors.urgencia?.message as string | undefined}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Síntomas"
                minRows={4}
                placeholder="Descripción breve..."
                error={errors.sintomas?.message}
                {...register("sintomas")}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Fieldset legend="Signos vitales (opcional)">
                <Grid gutter="xs">
                  <Grid.Col span={{ base: 6, md: 2 }}>
                    <TextInput placeholder="FC" {...register("signosVitales.FC" as const)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 2 }}>
                    <TextInput placeholder="FR" {...register("signosVitales.FR" as const)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 2 }}>
                    <TextInput placeholder="TA (120/80)" {...register("signosVitales.TA" as const)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 2 }}>
                    <TextInput placeholder="Temp (°C)" {...register("signosVitales.Temp" as const)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 2 }}>
                    <TextInput placeholder="SpO2 (%)" {...register("signosVitales.SpO2" as const)} />
                  </Grid.Col>
                </Grid>
                {errors.signosVitales && (
                  <Text size="sm" c="red" mt={6}>
                    Revisa rango/formato de signos vitales.
                  </Text>
                )}
              </Fieldset>
            </Grid.Col>

            <Grid.Col span={12}>
              <Group>
                <Button type="submit" loading={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Crear ticket"}
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </AppShell>
    </GlowCard>
  );
}
