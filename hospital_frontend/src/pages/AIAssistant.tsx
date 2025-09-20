// src/pages/AIAssistant.tsx
import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import {
  Card, Textarea, TextInput, Button, Grid, Text, Group,
  Badge, Paper, List, Stack, Divider, Tooltip, Select, CopyButton, ActionIcon
} from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { advise, type AdviceOutput } from "../lib/advisor";
import { triageCreate } from "../api/queue";
import { notifications } from "@mantine/notifications";
import GlowCard from "../components/GlowCard";

/* ---------- Tipos ---------- */
type Vitals = { FC?: number; FR?: number; TA?: string; Temp?: number; SpO2?: number };

type RichAdvice = AdviceOutput & {
  differentials?: Array<{ condition: string; likelihood?: 1|2|3|4|5; rationale?: string }>;
  redFlags?: string[];
  careAdvice?: string[];
  testsSuggested?: string[];
  severityScore?: number;     // 0..100
  riskBand?: "Bajo" | "Medio" | "Alto";
  followUps?: string[];       // preguntas de seguimiento sugeridas
  soap?: {                    // nota estilo SOAP
    subjetivo: string;
    objetivo: string;
    valoracion: string;
    plan: string;
  };
  disclaimer?: string;
};

export default function AIAssistant() {
  /* -------- Form state -------- */
  const [sintomas, setSintomas] = useState("");
  const [FC, setFC] = useState(""), [FR, setFR] = useState(""), [TA, setTA] = useState(""), [Temp, setTemp] = useState(""), [SpO2, setSpO2] = useState("");
  const [result, setResult] = useState<RichAdvice | null>(null);
  const [busy, setBusy] = useState(false);
  const [overrideUrgency, setOverrideUrgency] = useState<string | null>(null);

  const vitalesParsed: Vitals = useMemo(() => ({
    FC: toNum(FC), FR: toNum(FR), TA: TA || undefined, Temp: toNum(Temp), SpO2: toNum(SpO2),
  }), [FC, FR, TA, Temp, SpO2]);

  function toNum(v: string): number | undefined {
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : undefined;
  }

  /* -------- Análisis -------- */
  function onAnalyze(e: React.FormEvent) {
    e.preventDefault();

    const vitales: any = {};
    if (vitalesParsed.FC != null) vitales.FC = vitalesParsed.FC;
    if (vitalesParsed.FR != null) vitales.FR = vitalesParsed.FR;
    if (vitalesParsed.TA) vitales.TA = vitalesParsed.TA;
    if (vitalesParsed.Temp != null) vitales.Temp = vitalesParsed.Temp;
    if (vitalesParsed.SpO2 != null) vitales.SpO2 = vitalesParsed.SpO2;

    const base = advise({ sintomas: sintomas.trim(), vitales: Object.keys(vitales).length ? vitales : undefined });
    const enriched = enrichAdvice(sintomas, vitalesParsed, base);
    setResult(enriched);
    setOverrideUrgency(String(enriched.urgencia));
  }

  /* -------- Ticket desde sugerencia -------- */
  async function crearTicketDesdeSugerencia() {
    if (!result) return;
    const patientId = prompt("ID de paciente:", "demo-p1") || "demo-p1";
    setBusy(true);
    try {
      const urg = overrideUrgency ? Number(overrideUrgency) : result.urgencia;
      const { ticket } = await triageCreate({
        patientId,
        sintomas,
        urgencia: urg,
        signosVitales: {
          FC: vitalesParsed.FC,
          FR: vitalesParsed.FR,
          TA: vitalesParsed.TA,
          Temp: vitalesParsed.Temp,
          SpO2: vitalesParsed.SpO2,
        },
      } as any);
      notifications.show({ color: "green", title: "Ticket creado", message: `ID ${ticket.id} (U${ticket.urgencia})` });
    } catch (e: any) {
      notifications.show({ color: "red", title: "Error", message: e?.response?.data?.error?.code ?? "No se pudo crear el ticket" });
    } finally { setBusy(false); }
  }

  function limpiarInforme() { setResult(null); }

  /* -------- Render -------- */
  return (
    <GlowCard>
      <Layout>
        <Card withBorder shadow="sm">
          <Text fw={700} size="lg" mb="xs">Consultor IA (preventivo)</Text>
          <Text c="dimmed" size="sm" mb="md">Orientación clínica inicial (no sustituye evaluación médica).</Text>

          <form onSubmit={onAnalyze}>
            <Grid gutter="md">
              <Grid.Col span={12}>
                <Textarea
                  label="Relato del caso (síntomas en texto libre)"
                  rows={4}
                  value={sintomas}
                  onChange={(e)=>setSintomas(e.currentTarget.value)}
                  placeholder="Ej.: Adulto con fiebre 38.5°C, tos seca y disnea leve desde hace 2 días. Niega dolor torácico."
                />
              </Grid.Col>

              <Grid.Col span={12}><Text c="dimmed" size="sm">Signos vitales (opcional)</Text></Grid.Col>
              <Grid.Col span={2}><TextInput label="FC (lpm)" value={FC} onChange={(e)=>setFC(e.currentTarget.value)} /></Grid.Col>
              <Grid.Col span={2}><TextInput label="FR (rpm)" value={FR} onChange={(e)=>setFR(e.currentTarget.value)} /></Grid.Col>
              <Grid.Col span={3}><TextInput label="TA (mmHg)" placeholder="120/80" value={TA} onChange={(e)=>setTA(e.currentTarget.value)} /></Grid.Col>
              <Grid.Col span={2}><TextInput label="Temp (°C)" value={Temp} onChange={(e)=>setTemp(e.currentTarget.value)} /></Grid.Col>
              <Grid.Col span={3}><TextInput label="SpO₂ (%)" value={SpO2} onChange={(e)=>setSpO2(e.currentTarget.value)} /></Grid.Col>

              <Grid.Col span={12}>
                <Group>
                  <Button type="submit">Analizar</Button>
                  {result && (
                    <>
                      <Button variant="light" loading={busy} onClick={crearTicketDesdeSugerencia}>Crear ticket</Button>
                      <Tooltip label="Limpia solo el informe (mantiene texto y vitales)">
                        <Button variant="subtle" onClick={limpiarInforme}>Limpiar informe</Button>
                      </Tooltip>
                    </>
                  )}
                </Group>
              </Grid.Col>
            </Grid>
          </form>

          {result && (
            <Paper withBorder radius="md" p="md" mt="lg">
              <Group justify="space-between" align="center" mb="xs">
                <Text fw={600}>Informe orientativo</Text>
                <Group gap="xs">
                  <Badge variant="light" size="lg">Urgencia sugerida {result.urgencia}</Badge>
                  <Select
                    value={overrideUrgency ?? String(result.urgencia)}
                    onChange={(v)=>setOverrideUrgency(v)}
                    data={["1","2","3","4","5"]}
                    placeholder="Ajustar urgencia"
                    allowDeselect={false}
                    w={140}
                  />
                </Group>
              </Group>

              {/* Vitales */}
              <VitalsChips v={vitalesParsed} />

              {/* Severidad */}
              <SeverityBand score={result.severityScore ?? 0} band={result.riskBand ?? "Bajo"} />

              <Divider my="md" />

              {/* Diferenciales */}
              <Section title="Diagnósticos diferenciales">
                {result.differentials?.length ? (
                  <List spacing="xs">
                    {result.differentials.map((d, i) => (
                      <List.Item key={i}>
                        <b>{d.condition}</b>{" "}
                        {d.likelihood ? <Badge variant="light">Prob. {d.likelihood}/5</Badge> : null}
                        {d.rationale ? <div style={{ marginTop: 2 }}>{d.rationale}</div> : null}
                      </List.Item>
                    ))}
                  </List>
                ) : <Text c="dimmed">—</Text>}
              </Section>

              {/* Red flags */}
              <Section title="Signos de alarma">
                {result.redFlags?.length ? (
                  <List spacing="xs" icon={<span>⚠️</span>}>
                    {result.redFlags.map((r, i) => <List.Item key={i}>{r}</List.Item>)}
                  </List>
                ) : <Text c="dimmed">Sin hallazgos críticos del relato/vitales ingresados.</Text>}
              </Section>

              {/* Cuidados iniciales */}
              <Section title="Cuidados y orientación">
                {result.careAdvice?.length ? (
                  <List spacing="xs">
                    {result.careAdvice.map((c, i) => <List.Item key={i}>{c}</List.Item>)}
                  </List>
                ) : <Text c="dimmed">—</Text>}
              </Section>

              {/* Pruebas sugeridas */}
              <Section title="Pruebas sugeridas">
                {result.testsSuggested?.length ? (
                  <List spacing="xs">
                    {result.testsSuggested.map((t, i) => <List.Item key={i}>{t}</List.Item>)}
                  </List>
                ) : <Text c="dimmed">—</Text>}
              </Section>

              {/* Preguntas de seguimiento */}
              <Section title="Preguntas de seguimiento">
                {result.followUps?.length ? (
                  <List spacing="xs">
                    {result.followUps.map((q, i) => <List.Item key={i}>{q}</List.Item>)}
                  </List>
                ) : <Text c="dimmed">—</Text>}
              </Section>

              {/* SOAP + copiar */}
              <Divider my="md" />
              <Group justify="space-between" align="center">
                <Text fw={600}>Resumen (SOAP)</Text>
                <CopyButton value={buildSOAPText(result)}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copiado" : "Copiar"}>
                      <ActionIcon variant="light" onClick={copy}>
                        {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              <Paper withBorder radius="md" p="sm" mt="xs">
                <Text size="sm"><b>S:</b> {result.soap?.subjetivo}</Text>
                <Text size="sm"><b>O:</b> {result.soap?.objetivo}</Text>
                <Text size="sm"><b>A:</b> {result.soap?.valoracion}</Text>
                <Text size="sm"><b>P:</b> {result.soap?.plan}</Text>
              </Paper>

              <Divider my="sm" />
              <Text size="sm" c="dimmed">{result.disclaimer ?? "Este informe es orientativo y no sustituye la evaluación médica presencial."}</Text>
            </Paper>
          )}
        </Card>
      </Layout>
    </GlowCard>
  );
}

/* ---------- Auxiliares de UI ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap="xs" my="sm">
      <Text fw={600}>{title}</Text>
      {children}
    </Stack>
  );
}

function VitalsChips({ v }: { v: Vitals }) {
  const chips = [
    v.Temp != null ? `Temp ${v.Temp}°C` : null,
    v.FC != null ? `FC ${v.FC} lpm` : null,
    v.FR != null ? `FR ${v.FR} rpm` : null,
    v.TA ? `TA ${v.TA}` : null,
    v.SpO2 != null ? `SpO₂ ${v.SpO2}%` : null,
  ].filter(Boolean) as string[];
  if (chips.length === 0) return null;
  return (
    <Group gap="xs" wrap="wrap" mt="xs">
      {chips.map((c, i) => <Badge key={i} variant="outline">{c}</Badge>)}
    </Group>
  );
}

function SeverityBand({ score, band }: { score: number; band: "Bajo" | "Medio" | "Alto" }) {
  const color = band === "Alto" ? "red" : band === "Medio" ? "yellow" : "green";
  return (
    <Group mt="sm" gap="sm" align="center">
      <Badge color={color} variant="filled">Riesgo {band}</Badge>
      <Text size="sm" c="dimmed">Severidad estimada: {Math.round(score)} / 100</Text>
    </Group>
  );
}

/* ---------- Enriquecedor clínico (heurísticas seguras) ---------- */
function enrichAdvice(text: string, v: Vitals, base: AdviceOutput): RichAdvice {
  const tokens = text.toLowerCase();

  const differentials: RichAdvice["differentials"] = [];
  const redFlags: string[] = [];
  const careAdvice: string[] = [];
  const testsSuggested: string[] = [];
  const followUps: string[] = [];

  // Heurísticas simples por patrón de síntomas
  if (/tos|catarro|rinorrea|gripe|fiebre/.test(tokens)) {
    differentials?.push(
      { condition: "Infección respiratoria viral", likelihood: 4, rationale: "Cuadro respiratorio alto/curso breve" },
      { condition: "Neumonía adquirida en la comunidad", likelihood: 2, rationale: "Valorar si fiebre alta, dolor pleurítico, crepitantes" },
    );
    careAdvice.push("Hidratación adecuada", "Antitérmico/analgésico si precisa", "Vigilar signos de alarma");
    testsSuggested.push("Exploración respiratoria", "Rx tórax si signos focales/hipoxemia", "Prueba viral si procede");
    followUps.push("¿Disnea en reposo o al hablar?", "¿Dolor torácico pleurítico?", "¿Antecedentes respiratorios (asma/EPOC)?");
  }

  if (/dolor.*pecho|opresión.*pecho|torácic/.test(tokens)) {
    differentials?.push(
      { condition: "Síndrome coronario agudo (SCA)", likelihood: 2, rationale: "Dolor torácico; precisar características y factores de riesgo" },
      { condition: "Dolor musculoesquelético", likelihood: 2, rationale: "Dolor reproducible a la palpación o movimiento" },
    );
    redFlags.push("Dolor torácico opresivo irradiado", "Disnea intensa", "Síncope");
    testsSuggested.push("ECG 12 derivaciones", "Troponinas seriadas", "PA y saturación");
    followUps.push("¿Duración del dolor y relación con el esfuerzo?", "¿Factores de riesgo cardiovascular?");
  }

  if (/dolor.*abdomen|abdominal|nausea|vómit|diarrea/.test(tokens)) {
    differentials?.push(
      { condition: "Gastroenteritis aguda", likelihood: 3, rationale: "Dolor abdominal con síntomas digestivos" },
      { condition: "Colecistitis/colelitiasis", likelihood: 2, rationale: "Dolor HD, postprandial graso, Murphy positivo" },
    );
    redFlags.push("Dolor abdominal intenso con defensa", "Vómitos persistentes", "Sangre en heces");
    testsSuggested.push("BH, EGO", "Perfil hepático", "USG abdominal si cólico biliar");
    followUps.push("¿Localización exacta del dolor?", "¿Fiebre, ictericia, pérdida de peso?");
  }

  // Red flags por vitales
  if (v.SpO2 != null && v.SpO2 < 92) redFlags.push("Saturación < 92%");
  if (v.Temp != null && v.Temp >= 39.5) redFlags.push("Fiebre alta ≥ 39.5°C");
  if (v.FR != null && v.FR >= 30) redFlags.push("Taquipnea (FR ≥ 30 rpm)");
  if (v.FC != null && v.FC >= 120) redFlags.push("Taquicardia marcada (FC ≥ 120 lpm)");

  // Severidad: suma ponderada muy simple
  let score = 0;
  if (v.SpO2 != null) score += v.SpO2 < 90 ? 40 : v.SpO2 < 92 ? 30 : v.SpO2 < 94 ? 15 : 0;
  if (v.Temp != null) score += v.Temp >= 40 ? 20 : v.Temp >= 39 ? 10 : 0;
  if (v.FR != null) score += v.FR >= 30 ? 15 : v.FR >= 24 ? 8 : 0;
  if (v.FC != null) score += v.FC >= 130 ? 15 : v.FC >= 110 ? 8 : 0;
  const band: "Bajo" | "Medio" | "Alto" = score >= 45 ? "Alto" : score >= 20 ? "Medio" : "Bajo";

  // Si no hay diferenciales, añade genérico
  if (!differentials?.length) {
    differentials?.push({ condition: "Evaluación clínica general", likelihood: 3, rationale: "Datos insuficientes; orientar según evolución" });
  }
  if (!careAdvice.length) careAdvice.push("Reposo relativo", "Hidratación", "Reevaluar si empeora");
  if (!followUps.length) followUps.push("¿Inicio, duración y factores que alivian/agravan?", "¿Antecedentes relevantes y medicación?");

  // SOAP
  const soap = buildSOAP(text, v, differentials, redFlags, careAdvice, testsSuggested);

  return {
    ...base,
    differentials,
    redFlags: dedup(redFlags),
    careAdvice: dedup(careAdvice),
    testsSuggested: dedup(testsSuggested),
    followUps: dedup(followUps),
    severityScore: Math.min(100, Math.max(0, Math.round(score))),
    riskBand: band,
    soap,
    disclaimer: "Este informe es orientativo y no sustituye la evaluación médica presencial.",
  };
}

/* ---------- Utilidades ---------- */
function dedup<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

function buildSOAPText(r: RichAdvice): string {
  return [
    `S: ${r.soap?.subjetivo ?? "-"}`,
    `O: ${r.soap?.objetivo ?? "-"}`,
    `A: ${r.soap?.valoracion ?? "-"}`,
    `P: ${r.soap?.plan ?? "-"}`,
  ].join("\n");
}

function buildSOAP(
  text: string,
  v: Vitals,
  differentials: NonNullable<RichAdvice["differentials"]>,
  redFlags: string[],
  careAdvice: string[],
  testsSuggested: string[],
): RichAdvice["soap"] {
  const S = text.trim() || "Relato no proporcionado";
  const Oparts = [
    v.Temp != null ? `Temp ${v.Temp}°C` : null,
    v.FC != null ? `FC ${v.FC} lpm` : null,
    v.FR != null ? `FR ${v.FR} rpm` : null,
    v.TA ? `TA ${v.TA}` : null,
    v.SpO2 != null ? `SpO₂ ${v.SpO2}%` : null,
  ].filter(Boolean);
  const O = Oparts.length ? Oparts.join(" · ") : "Sin signos vitales ingresados";

  const diffs = differentials.map(d => d.condition + (d.likelihood ? ` (P${d.likelihood}/5)` : "")).join("; ");
  const RF = redFlags.length ? ` | Red flags: ${redFlags.join("; ")}` : "";
  const A = `${diffs || "Valoración inicial no concluyente"}${RF}`;

  const planParts = [
    careAdvice.length ? `Cuidados: ${careAdvice.join("; ")}` : null,
    testsSuggested.length ? `Pruebas sugeridas: ${testsSuggested.join("; ")}` : null,
  ].filter(Boolean);
  const P = planParts.join(" | ") || "Plan a definir según evolución";

  return { subjetivo: S, objetivo: O, valoracion: A, plan: P };
}
