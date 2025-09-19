import type { TriageTicket } from "../types";

function urgencyLabel(u: 1 | 2 | 3) {
  return u === 1 ? "🔴 Crítica" : u === 2 ? "🟠 Urgente" : "🟢 Normal";
}

export default function QueueTable({
  items,
  selectedId,
  onSelect,
}: {
  items: TriageTicket[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Paciente</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Urgencia</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Llegada</th>
        </tr>
      </thead>
      <tbody>
        {items.map((t) => {
          const isSel = selectedId === t.id;
          return (
            <tr
              key={t.id}
              onClick={() => onSelect?.(t.id)}
              style={{
                cursor: "pointer",
                background: isSel ? "#eef6ff" : undefined,
              }}
              title="Click para seleccionar"
            >
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{t.patientId}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{urgencyLabel(t.urgencia)}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                {new Date(t.llegadaAt).toLocaleTimeString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}


