import { WorkflowDSLNode } from "./WorkflowDSLNode.interface";

export interface WorkflowDSL {
  trigger: WorkflowDSLNode;
  steps: WorkflowDSLNode[];
}
