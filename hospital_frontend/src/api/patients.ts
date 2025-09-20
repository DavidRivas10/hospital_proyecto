import api, { apiPath } from "./http";

export type Patient = {
  _id?: string;
  id?: string;
  docId?: string;
  fullName: string;
  birthDate?: string;       // yyyy-mm-dd
  sex?: "M" | "F" | "O";
  phone?: string;
  email?: string;
  address?: string;
  allergies?: string[];
  chronicConditions?: string[];
};

function toArray(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") {
    const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length ? arr : undefined;
  }
  return undefined;
}

/** Genera un docId válido: SOLO A–Z y 0–9 (sin guiones) */
function generateDocId(): string {
  const base = Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "");
  // 12 chars alfanum, prefijo HNPA
  const b = base.padStart(12, "0").slice(-12);
  return `HNPA${b}`; // p.ej. HNPA00AB12CD34
}

/** Construye payload “limpio” y sin campos vacíos */
function sanitizePayload(input: Patient) {
  const docId = (input.docId && input.docId.trim())
    ? input.docId.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
    : generateDocId();

  const fullName = (input.fullName ?? "").trim();
  const birthDate = input.birthDate || undefined;
  const sex = (input.sex as any) ?? "O";

  const phoneDigits = (input.phone ?? "").replace(/\D/g, "");
  const phone = phoneDigits.length === 8 ? phoneDigits : undefined;

  const emailTrim = (input.email ?? "").trim();
  const email =
    emailTrim && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim) ? emailTrim : undefined;

  const addressTrim = (input.address ?? "").trim();
  const address = addressTrim.length >= 3 ? addressTrim : undefined;

  const arr = (v?: string[] | string) => (toArray(v) ?? []).map(s=>s.trim()).filter(Boolean);

  const allergiesArr = arr(input.allergies);
  const chronicArr = arr(input.chronicConditions);

  // 🔑 no enviar arrays vacíos: muchos schemas los rechazan
  const payload: any = {
    docId,
    fullName,
    birthDate,
    sex,
    phone,
    email,
    address,
  };
  if (allergiesArr.length) payload.allergies = allergiesArr;
  if (chronicArr.length) payload.chronicConditions = chronicArr;

  return payload;
}

export async function listPatients(): Promise<Patient[]> {
  const { data } = await api.get(apiPath("/patients"));
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.patients)) return data.patients;
  return [];
}

export async function createPatient(input: Patient): Promise<Patient> {
  const payload = sanitizePayload(input);

  if (!payload.fullName) throw new Error("FULLNAME_REQUIRED");
  if (!/^[A-Z0-9]{3,}$/.test(payload.docId)) throw new Error("DOCID_INVALID");

  const res = await api.post(apiPath("/patients"), payload).catch((err) => {
    console.log("[createPatient] 400 payload:", payload, " server says:", err?.response?.data);
    throw err;
  });

  return res.data?.patient ?? res.data;
}
