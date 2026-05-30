import type { WorkflowStore } from "@/features/workflow-builder";
import type { WorkflowDSL } from "./types/WorkflowDSL.inteface";

export function workflowToDSL(workflow: WorkflowStore): WorkflowDSL {
  const triggerNode = workflow.nodes.find((node) => {
    return node.kind == "trigger";
  });

  if (!triggerNode) {
    throw new Error("No trigger node found");
  }

  const steps = [];

  let currentNode = triggerNode;

  while (true) {
    const nextEdge = workflow.edges.find(
      (edge) => edge.source === currentNode.id,
    );

    if (!nextEdge) {
      break;
    }

    const nextNode = workflow.nodes.find((node) => node.id === nextEdge.target);

    if (!nextNode) {
      break;
    }

    steps.push({
      id: nextNode.id,
      type: nextNode.definitionType,
      config: nextNode.config as any,
    });

    currentNode = nextNode;
  }

  return {
    trigger: {
      id: triggerNode.id,
      type: triggerNode.definitionType,
      config: triggerNode.config as any,
    },
    steps,
  };
}
