import type { WorkflowNodeInstance } from "@/features/workflow-builder/types";

export function resolveNodeOutputs(node: WorkflowNodeInstance) {
  if (node.definitionType === "form-submit") {
    return node.config.fields || [];
  }

  return [];
}
