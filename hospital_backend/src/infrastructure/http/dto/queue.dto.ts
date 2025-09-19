import { z } from "zod";

export const reprioritizeSchema = z.object({
  urgencia: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});
export type ReprioritizeDTO = z.infer<typeof reprioritizeSchema>;
