import { z } from "zod";

export const patientCreateSchema = z.object({
  docId: z.string().min(1),
  fullName: z.string().min(1),
  birthDate: z.string().datetime().optional(), // ISO string
  sex: z.enum(["M", "F", "O"]).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
});

export const patientUpdateSchema = patientCreateSchema.partial();

export type PatientCreateDTO = z.infer<typeof patientCreateSchema>;
export type PatientUpdateDTO = z.infer<typeof patientUpdateSchema>;
