import api, { apiPath } from "./http";

export type Patient = {
  _id?: string;
  id?: string;              // lo devuelve el backend (no lo mandamos)
  docId?: string;           // tu ID visible (p.ej. p123)
  fullName: string;
  birthDate?: string;       // yyyy-mm-dd
  sex?: "M" | "F" | "O";
  phone?: string;
  email?: string;
  address?: string;
  allergies?: string[];           // SIEMPRE arrays
  chronicConditions?: string[];   // SIEMPRE arrays
};

function toArray(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") {
    const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length ? arr : undefined;
  }
  return undefined;
}

export async function listPatients(): Promise<Patient[]> {
  // ✅ apiPath resuelve el prefijo /v1 (evita /v1/v1)
  const { data } = await api.get(apiPath("/patients"));
  // tolerante a distintas formas de payload
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.patients)) return data.patients;
  return [];
}

export async function createPatient(input: Patient): Promise<Patient> {
  // Limpieza mínima para cumplir con el schema del backend
  const phoneDigits = (input.phone ?? "").replace(/\D/g, ""); // solo dígitos
  const payload = {
    docId: input.docId?.trim() || undefined,
    fullName: input.fullName?.trim(),
    birthDate: input.birthDate || undefined,
    sex: (input.sex as any) ?? "O",
    phone: phoneDigits ? phoneDigits : undefined,        // ⬅️ solo dígitos o undefined
    email: input.email?.trim() || undefined,
    address: input.address?.trim() || undefined,
    allergies: toArray(input.allergies) ?? [],
    chronicConditions: toArray(input.chronicConditions) ?? [],
  };

  if (!payload.fullName) throw new Error("FULLNAME_REQUIRED");

  const res = await api.post(apiPath("/patients"), payload).catch((err) => {
    console.log("[createPatient] 400 payload:", payload, " server says:", err?.response?.data);
    throw err;
  });

  // tu backend responde { patient: {...} }
  return res.data?.patient ?? res.data;
}

