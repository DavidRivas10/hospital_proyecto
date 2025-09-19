import { z } from "zod";

export const triageCreateSchema = z.object({
  patientId: z.string().min(1),
  sintomas: z.string().min(1),
  signosVitales: z
    .object({
      FC: z.number().int().positive().optional(),
      FR: z.number().int().positive().optional(),
      TA: z.string().optional(),
      Temp: z.number().optional(),
      SpO2: z.number().int().min(0).max(100).optional(),
    })
    .optional(),
  urgencia: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export type TriageCreateDTO = z.infer<typeof triageCreateSchema>;
