import type { Edge } from "@xyflow/react";

import type { WorkflowEdge } from "@/features/workflow-builder/types";

export function mapWorkflowEdgesToReactFlow(
  workflowEdges: WorkflowEdge[],
): Edge[] {
  return workflowEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));
}
