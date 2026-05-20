import type { Node } from "@xyflow/react";

import type { WorkflowNodeInstance } from "@/features/workflow-builder/types";

export function mapWorkflowNodesToReactFlow(
  workflowNodes: WorkflowNodeInstance[],
): Node[] {
  return workflowNodes.map((node) => ({
    id: node.id,
    type: "custom",
    position: node.position,
    data: {
      definitionType: node.definitionType,
      kind: node.kind,
      config: node.config,
    },
  }));
}
