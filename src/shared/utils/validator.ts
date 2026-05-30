import { z } from "zod";

export function normalizeForValidation(values: Record<string, unknown>) {
  const cleaned: Record<string, unknown> = { ...values };
  const boundKeys: string[] = [];

  for (const key in cleaned) {
    const value = cleaned[key];

    // binding → remove entirely so Zod skips it
    if (
      value &&
      typeof value === "object" &&
      (value as any).kind === "binding"
    ) {
      delete cleaned[key];
      boundKeys.push(key);
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
  return { cleaned, boundKeys };
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
  const { cleaned, boundKeys } = normalizeForValidation(values);

  // Make bound fields optional so Zod won't fail on missing keys
  let effectiveSchema = schema;
  if (boundKeys.length > 0 && schema instanceof z.ZodObject) {
    const partialShape: Record<string, z.ZodTypeAny> = {};
    for (const key of boundKeys) {
      partialShape[key] = z.any().optional();
    }
    effectiveSchema = schema.extend(partialShape);
  }

  const result = effectiveSchema.safeParse(cleaned);
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
