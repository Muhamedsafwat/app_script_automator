import { ConfigValue } from "../types/ConfigValue.type";
import { resolveBindingValue } from "./resolve-binding-value";

export function compileNodeCofig(config: Record<string, ConfigValue>) {
  const compiled: Record<string, string> = {};

  for (const [key, value] of Object.entries(config)) {
    compiled[key] = resolveBindingValue(value);
  }
  return compiled;
}
