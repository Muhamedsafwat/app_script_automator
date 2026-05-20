import { z } from "zod";

export interface ValidationError {
  [key: string]: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationError;
}

/**
 * Validates form values against a Zod schema and returns formatted errors
 */
export function validateForm(
  schema: z.ZodTypeAny,
  values: Record<string, unknown>
): ValidationResult {
  const result = schema.safeParse(values);
  if (result.success) {
    return { success: true, errors: {} };
  }

  const errors: ValidationError = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path[0];
    if (typeof path === "string" || typeof path === "number") {
      errors[path] = issue.message;
    }
  });

  return { success: false, errors };
}
