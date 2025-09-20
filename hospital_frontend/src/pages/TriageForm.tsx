// src/pages/TriageForm.tsx
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Select,
  TextInput,
  Textarea,
  Fieldset,
  Group,
  Title,
  Text,
  Grid,
} from "@mantine/core";
import AppShell from "../components/AppShell";
import { triageSchema, type TriageFormData } from "../validation/traige"; // o "../validation/triage"
import { triageCreate } from "../api/queue";
import GlowCard from "../components/GlowCard";
import { newPatientId } from "../utils/id"; // ⬅️ auto-ID

// ───────────────────────────────────────────────────────────────────────────────
// Helpers para formateo de signos vitales
function onlyDigits(s: string) {
  return s.replace(/\D+/g, "");
}
function formatTA(input: string) {
  // deja sólo dígitos y coloca una "/" entre sistólica y diastólica
  const digits = onlyDigits(input).slice(0, 6); // ej. 12080 (máx 6)
  const sys = digits.slice(0, 3);
  const dia = digits.slice(3, 6);
  return dia ? `${sys}/${dia}` : sys;
}
// ───────────────────────────────────────────────────────────────────────────────

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
      patientId: newPatientId(), // ⬅️ ID inicial automático
      sintomas: "",
      urgencia: 3,
      signosVitales: { FC: "", FR: "", TA: "", Temp: "", SpO2: "" } as any,
    },
  });

  const onSubmit: SubmitHandler<TriageFormData> = async (values) => {
    await triageCreate(values as unknown as any);
    sessionStorage.setItem("queue:changed", Date.now().toString());
    // ⬅️ tras guardar, limpia el form y genera un nuevo ID
    reset({
      patientId: newPatientId(),
      sintomas: "",
      urgencia: 3,
      signosVitales: { FC: "", FR: "", TA: "", Temp: "", SpO2: "" } as any,
    });
  };

  const urgencia = String(watch("urgencia") ?? 3);
  const taValue = watch("signosVitales.TA" as const) ?? "";

  const regenerateId = () => {
    setValue("patientId", newPatientId(), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <GlowCard>
      <AppShell>
        <Title order={2}>Nuevo triaje</Title>
        <Text c="dimmed" mb="md">
          Crear ticket para la cola de atención
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid gutter="sm">
            <Grid.Col span={12}>
              <TextInput
                label="Paciente (ID)"
                placeholder="p-xxxxxxxx"
                error={errors.patientId?.message}
                rightSection={
                  <Button
                    size="xs"
                    variant="light"
                    onClick={regenerateId}
                    type="button"
                  >
                    Nuevo ID
                  </Button>
                }
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
                onChange={(v) =>
                  setValue("urgencia", Number(v ?? 3), {
                    shouldValidate: true,
                  })
                }
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
                    <TextInput
                      placeholder="FC"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      rightSection={<Text c="dimmed" size="sm">lpm</Text>}
                      {...register("signosVitales.FC" as const)}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 6, md: 2 }}>
                    <TextInput
                      placeholder="FR"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      rightSection={<Text c="dimmed" size="sm">rpm</Text>}
                      {...register("signosVitales.FR" as const)}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 6, md: 2 }}>
                    <TextInput
                      placeholder="TA (120/80)"
                      value={taValue}
                      onChange={(e) =>
                        setValue(
                          "signosVitales.TA" as const,
                          formatTA(e.target.value),
                          { shouldValidate: true, shouldDirty: true }
                        )
                      }
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 6, md: 2 }}>
                    <TextInput
                      placeholder="Temp"
                      inputMode="decimal"
                      rightSection={<Text c="dimmed" size="sm">°C</Text>}
                      {...register("signosVitales.Temp" as const)}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 6, md: 2 }}>
                    <TextInput
                      placeholder="SpO2"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      rightSection={<Text c="dimmed" size="sm">%</Text>}
                      {...register("signosVitales.SpO2" as const)}
                    />
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

