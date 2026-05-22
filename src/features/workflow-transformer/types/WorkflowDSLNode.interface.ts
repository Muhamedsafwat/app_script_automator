export interface WorkflowDSLNode {
  id: string;
  type: string;
  config: Record<string, unknown>;
}
