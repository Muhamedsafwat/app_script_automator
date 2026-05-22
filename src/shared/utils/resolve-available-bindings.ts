import type { WorkflowNodeInstance } from "@/features/workflow-builder/types";
import { resolveNodeOutputs } from "./resolve-node-ouptut";

export function resolveAvailableBindings(
  workflowNodes: WorkflowNodeInstance[],

  currentNodeId: string,
) {
  const variables = [];

  for (const node of workflowNodes) {
    if (node.id === currentNodeId) continue;

    const outputs = resolveNodeOutputs(node);

    for (const output of Object.values(outputs)) {
      variables.push({
        nodeId: node.id,
        field: output.name,
        type: output.type,
        label: `${node.definitionType}.${output.name}`,
      });
    }
  }

  return variables;
}
