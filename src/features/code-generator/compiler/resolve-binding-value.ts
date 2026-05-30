import type { ConfigValue } from "../types/ConfigValue.type";

export function resolveBindingValue(value: ConfigValue) {
  if (value.kind === "static") {
    return JSON.stringify(value.value);
  }
  return `e.namedValues['${value.sourceField}'][0]`;
}
