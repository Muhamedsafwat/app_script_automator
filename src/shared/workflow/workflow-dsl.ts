import { ConfigValue } from "./config-value";

export interface WorkflowDSL {
  trigger: WorkflowDSLNode;
  steps: WorkflowDSLNode[];
}

export interface WorkflowDSLNode {
  id: string;
  type: string;
  config: Record<string, ConfigValue>;
}
