import { client } from "./client";

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
  const { data } = await client.get("/v1/patients");
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function createPatient(input: Patient): Promise<Patient> {
  // CONTRATO EN ESPAÑOL que definiste
  const payload = {
    docId: input.docId?.trim() || undefined, // NO enviar "id"; tu backend espera docId
    fullName: input.fullName?.trim(),
    birthDate: input.birthDate || undefined,
    sex: (input.sex as any) ?? "O",
    phone: input.phone || undefined,
    email: input.email || undefined,
    address: input.address || undefined,
    allergies: toArray(input.allergies) ?? [],            // arrays
    chronicConditions: toArray(input.chronicConditions) ?? [],
  };

  if (!payload.fullName) throw new Error("FULLNAME_REQUIRED");

  const res = await client.post("/v1/patients", payload).catch((err) => {
    console.log("[createPatient] 400 payload:", payload, " server says:", err?.response?.data);
    throw err;
  });
  return res.data;
}
