import { z } from "zod";

export const triageSchema = z.object({
  patientId: z.string().min(1, "Requerido"),
  sintomas: z.string().min(1, "Requerido"),
  urgencia: z.number().min(1).max(3),
  signosVitales: z.object({
    FC: z.string().optional(),
    FR: z.string().optional(),
    TA: z.string().optional(),
    Temp: z.string().optional(),
    SpO2: z.string().optional(),
  }).optional(),
});

export type TriageFormData = z.infer<typeof triageSchema>;
