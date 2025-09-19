// src/validation/schemas.ts  (barrel)
import { z } from "zod";
export { triageSchema } from "./traige";
export type { TriageFormData } from "./traige";

// Si Patients.tsx importa esto, defínelo aquí:
export const patientSchema = z.object({
  docId: z.string().min(1, "ID requerido"),
  fullName: z.string().min(1, "Nombre requerido"),
  birthDate: z.string().optional().or(z.literal("")),
  sex: z.enum(["M", "F", "O"]),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
}).strict();

export type PatientFormData = z.infer<typeof patientSchema>;
