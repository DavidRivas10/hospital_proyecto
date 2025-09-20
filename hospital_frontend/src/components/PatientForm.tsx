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

  // ---- estilos mínimos para buena presentación (sin Mantine) ----
  const fieldWrap: React.CSSProperties = { display: "block" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: 4, fontWeight: 500 };
  const controlStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 0,
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid var(--mantine-color-gray-4, #dcdcdc)",
    outline: "none",
  };

  // límite para evitar fechas futuras (coincide con la validación del backend)
  const todayYmd = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 12, width: "100%", minWidth: 0 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Documento</label>
          <input
            name="docId"
            value={values.docId}
            onChange={handleChange}
            required
            minLength={3}                 // evita docId demasiado corto
            style={controlStyle}
          />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Nombre completo</label>
          <input
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            required
            style={controlStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Fecha de nacimiento</label>
          <input
            type="date"
            name="birthDate"
            value={values.birthDate ?? ""}
            onChange={handleChange}
            max={todayYmd}               // no permitir fechas futuras
            style={controlStyle}
          />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Sexo</label>
          <select
            name="sex"
            value={values.sex ?? "O"}
            onChange={handleChange}
            style={controlStyle}
          >
            <option value="M">M</option>
            <option value="F">F</option>
            <option value="O">O</option>
          </select>
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Teléfono</label>
          <input
            name="phone"
            value={values.phone ?? ""}
            onChange={handleChange}
            pattern="^\d{9,15}$"        // 9 a 15 dígitos
            title="Ingresa entre 9 y 15 dígitos (solo números)"
            style={controlStyle}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            name="email"
            value={values.email ?? ""}
            onChange={handleChange}
            style={controlStyle}
          />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Dirección</label>
          <input
            name="address"
            value={values.address ?? ""}
            onChange={handleChange}
            style={controlStyle}
          />
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Alergias (separadas por coma)</label>
        <input
          value={allergyText}
          onChange={(e) => setAllergyText(e.target.value)}
          placeholder="penicilina, polen"
          style={controlStyle}
        />
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Condiciones crónicas (separadas por coma)</label>
        <input
          value={chronicText}
          onChange={(e) => setChronicText(e.target.value)}
          placeholder="asma, hipertensión"
          style={controlStyle}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={submitting} style={{ ...controlStyle, width: "auto", cursor: "pointer" }}>
          {submitting ? "Guardando..." : "Guardar"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{ ...controlStyle, width: "auto", cursor: "pointer" }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

