// src/pages/PatientDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getHistory, type HistoryItem } from "../api/history";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [all, setAll] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getHistory(1000); // acepta número
        setAll(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const items = useMemo(
    () => all.filter((x) => x.ticket?.patientId === id),
    [all, id]
  );

  return (
    <Layout>
      <div className="mb-3">
        <Link to="/patients" className="text-brand-600 hover:underline">← Volver a Pacientes</Link>
      </div>
      <h1 className="text-2xl font-semibold mb-2">Paciente: {id}</h1>
      <p className="text-gray-600 mb-4">Eventos registrados: <b>{items.length}</b></p>

      <div className="bg-white border rounded divide-y">
        {loading && <div className="p-3 text-sm text-gray-500">Cargando…</div>}
        {!loading && items.length === 0 && <div className="p-3 text-sm text-gray-500">Sin registros.</div>}
        {items.map((h) => (
          <div key={h.id} className="p-3 text-sm flex items-center justify-between">
            <div>
              <div className="font-medium">{h.type}</div>
              <div className="text-gray-500">{new Date(h.at).toLocaleString()}</div>
            </div>
            <div className="text-gray-700">
              {h.ticket ? <>U{h.ticket.urgencia ?? h.ticket.urgency} · ticket {h.ticket.id}</> : null}
              {h.type === "reprioritize" && h.prevUrgencia && h.newUrgencia
                ? <> · U{h.prevUrgencia}→U{h.newUrgencia}</>
                : null}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
