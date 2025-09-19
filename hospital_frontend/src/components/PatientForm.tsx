import { useEffect, useState } from "react";
import type { Patient } from "../types/patient";

export type PatientFormValues = {
  docId: string;
  fullName: string;
  birthDate?: string; // yyyy-mm-dd (input date)
  sex?: "M" | "F" | "O";
  phone?: string;
  email?: string;
  address?: string;
  allergies?: string[];
  chronicConditions?: string[];
};

function isoToYmd(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function PatientForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Patient | null;
  submitting?: boolean;
  onSubmit: (v: PatientFormValues) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<PatientFormValues>({
    docId: "",
    fullName: "",
    birthDate: "",
    sex: "O",
    phone: "",
    email: "",
    address: "",
    allergies: [],
    chronicConditions: [],
  });

  const [allergyText, setAllergyText] = useState("");
  const [chronicText, setChronicText] = useState("");

  useEffect(() => {
    if (initial) {
      setValues({
        docId: initial.docId ?? "",
        fullName: initial.fullName ?? "",
        birthDate: isoToYmd(initial.birthDate),
        sex: (initial.sex as any) ?? "O",
        phone: initial.phone ?? "",
        email: initial.email ?? "",
        address: initial.address ?? "",
        allergies: initial.allergies ?? [],
        chronicConditions: initial.chronicConditions ?? [],
      });
      setAllergyText((initial.allergies ?? []).join(", "));
      setChronicText((initial.chronicConditions ?? []).join(", "));
    }
  }, [initial]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allergies = allergyText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const chronicConditions = chronicText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({
      ...values,
      allergies,
      chronicConditions,
      birthDate: values.birthDate || undefined,
      sex: values.sex || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label>Documento</label>
          <input name="docId" value={values.docId} onChange={handleChange} required />
        </div>
        <div>
          <label>Nombre completo</label>
          <input name="fullName" value={values.fullName} onChange={handleChange} required />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div>
          <label>Fecha de nacimiento</label>
          <input type="date" name="birthDate" value={values.birthDate ?? ""} onChange={handleChange} />
        </div>
        <div>
          <label>Sexo</label>
          <select name="sex" value={values.sex ?? "O"} onChange={handleChange}>
            <option value="M">M</option>
            <option value="F">F</option>
            <option value="O">O</option>
          </select>
        </div>
        <div>
          <label>Teléfono</label>
          <input name="phone" value={values.phone ?? ""} onChange={handleChange} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={values.email ?? ""} onChange={handleChange} />
        </div>
        <div>
          <label>Dirección</label>
          <input name="address" value={values.address ?? ""} onChange={handleChange} />
        </div>
      </div>

      <div>
        <label>Alergias (separadas por coma)</label>
        <input value={allergyText} onChange={(e) => setAllergyText(e.target.value)} placeholder="penicilina, polen" />
      </div>

      <div>
        <label>Condiciones crónicas (separadas por coma)</label>
        <input value={chronicText} onChange={(e) => setChronicText(e.target.value)} placeholder="asma, hipertensión" />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
