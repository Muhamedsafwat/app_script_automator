import { ConfigValue } from "@/features/code-generator/types/ConfigValue.type";

export interface WorkflowDSLNode {
  id: string;
  type: string;
  config: Record<string, ConfigValue>;
}
