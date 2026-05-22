import { z } from "zod";

export function normalizeForValidation(values: Record<string, unknown>) {
  const cleaned: Record<string, unknown> = { ...values };

  for (const key in cleaned) {
    const value = cleaned[key];

    // binding → ignore
    if (
      value &&
      typeof value === "object" &&
      (value as any).kind === "binding"
    ) {
      cleaned[key] = ""; // أو fallback safe value
      continue;
    }

    // static wrapper
    if (
      value &&
      typeof value === "object" &&
      (value as any).kind === "static"
    ) {
      cleaned[key] = (value as any).value;
    }
  }
  return cleaned;
}

export interface ValidationError {
  [key: string]: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationError;
}

export function validateForm(
  schema: z.ZodTypeAny,
  values: Record<string, unknown>,
): ValidationResult {
  const cleanedValues = normalizeForValidation(values);

  const result = schema.safeParse(cleanedValues);
  if (result.success) {
    return {
      success: true,
      errors: {},
    };
  }

  const errors: ValidationError = {};

  result.error.issues.forEach((issue) => {
    const path = issue.path[0];

    if (typeof path === "string" || typeof path === "number") {
      errors[path] = issue.message;
    }
  });

  return {
    success: false,
    errors,
  };
}
