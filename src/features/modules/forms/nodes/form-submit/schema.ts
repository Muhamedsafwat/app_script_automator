import { z } from "zod";

export const FormSubmitSchema = z.object({
  formId: z.string().min(1),
});

export type FormSubmitConfig = z.infer<typeof FormSubmitSchema>;
