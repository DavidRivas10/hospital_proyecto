// src/pages/AIAssistant.tsx
import { useState } from "react";
import Layout from "../components/Layout";
import { Card, Textarea, TextInput, Button, Grid, Text, Group } from "@mantine/core";
import { advise, type AdviceOutput } from "../lib/advisor";
import { triageCreate } from "../api/queue";
import { notifications } from "@mantine/notifications";
import GlowCard from "../components/GlowCard";


export default function AIAssistant() {
  const [sintomas, setSintomas] = useState("");
  const [FC, setFC] = useState(""), [FR, setFR] = useState(""), [TA, setTA] = useState(""), [Temp, setTemp] = useState(""), [SpO2, setSpO2] = useState("");
  const [result, setResult] = useState<AdviceOutput | null>(null);
  const [busy, setBusy] = useState(false);

  function onAnalyze(e: React.FormEvent) {
    e.preventDefault();
    const vitales: any = {};
    if (FC) vitales.FC = FC;
    if (FR) vitales.FR = FR;
    if (TA) vitales.TA = TA;
    if (Temp) vitales.Temp = Temp;
    if (SpO2) vitales.SpO2 = SpO2;
    setResult(advise({ sintomas, vitales: Object.keys(vitales).length ? vitales : undefined }));
  }

  async function crearTicketDesdeSugerencia() {
    if (!result) return;
    const patientId = prompt("ID de paciente:", "demo-p1") || "demo-p1";
    setBusy(true);
    try {
      const { ticket } = await triageCreate({
        patientId,
        sintomas,
        urgencia: result.urgencia,
        signosVitales: {
          FC: FC || undefined,
          FR: FR || undefined,
          TA: TA || undefined,
          Temp: Temp || undefined,
          SpO2: SpO2 || undefined,
        },
      } as any); // si TS molesta, este cast evita conflicto con TriageFormData
      notifications.show({ color: "green", title: "Ticket creado", message: `ID ${ticket.id} (U${ticket.urgencia})` });
    } catch (e: any) {
      notifications.show({ color: "red", title: "Error", message: e?.response?.data?.error?.code ?? "No se pudo crear el ticket" });
    } finally { setBusy(false); }
  }

  return (
    <GlowCard>
    <Layout>
      <Card withBorder shadow="sm">
        <Text fw={600} mb="xs">Consultor IA (preventivo)</Text>
        <form onSubmit={onAnalyze}>
          <Grid>
            <Grid.Col span={12}>
              <Textarea label="Síntomas (texto libre)" rows={4} value={sintomas} onChange={(e)=>setSintomas(e.currentTarget.value)} />
            </Grid.Col>
            <Grid.Col span={12}><Text c="dimmed" size="sm">Signos vitales (opcional)</Text></Grid.Col>
            <Grid.Col span={2}><TextInput placeholder="FC" value={FC} onChange={(e)=>setFC(e.currentTarget.value)} /></Grid.Col>
            <Grid.Col span={2}><TextInput placeholder="FR" value={FR} onChange={(e)=>setFR(e.currentTarget.value)} /></Grid.Col>
            <Grid.Col span={3}><TextInput placeholder="TA (120/80)" value={TA} onChange={(e)=>setTA(e.currentTarget.value)} /></Grid.Col>
            <Grid.Col span={2}><TextInput placeholder="Temp (°C)" value={Temp} onChange={(e)=>setTemp(e.currentTarget.value)} /></Grid.Col>
            <Grid.Col span={3}><TextInput placeholder="SpO2 (%)" value={SpO2} onChange={(e)=>setSpO2(e.currentTarget.value)} /></Grid.Col>
            <Grid.Col span={12}>
              <Group>
                <Button type="submit">Analizar</Button>
                {result && <Button variant="light" loading={busy} onClick={crearTicketDesdeSugerencia}>Crear ticket</Button>}
              </Group>
            </Grid.Col>
          </Grid>
        </form>

        {result && (
          <div className="mt-4 p-3 border rounded">
            <Text fw={600}>Resultado</Text>
            <div>Urgencia sugerida: <b>U{result.urgencia}</b></div>
            {result.reasons.length > 0 && (
              <ul className="list-disc ml-5">
                {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
            <div className="mt-2">{result.recommendation}</div>
          </div>
        )}
      </Card>
    </Layout>
    </GlowCard>
  );
}
