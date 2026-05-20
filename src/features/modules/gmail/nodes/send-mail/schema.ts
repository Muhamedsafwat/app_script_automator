import { z } from "zod";

export const SendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export type SendEmailConfig =
  z.infer<typeof SendEmailSchema>;