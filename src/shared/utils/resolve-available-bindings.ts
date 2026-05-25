import { useWorkflowStore } from "@/features/workflow-builder";
import {
  NodeOutput,
  GroupedNodeOutput,
  FieldType,
} from "../types/node.interface";

export function resolveAvailableBindings(
  currentNodeId: string,
): GroupedNodeOutput {
  const { edges, nodes } = useWorkflowStore.getState();
  const inputEdge = edges.find((edge) => edge.target == currentNodeId);
  const sourceNode = nodes.find((node) => node.id == inputEdge?.source);

  const outputs: NodeOutput[] = (sourceNode?.config?.outputs ??
    []) as NodeOutput[];

  const grouped = Object.entries(outputs).reduce(
    (acc, [name, field]) => {
      const type = field.type;

      if (!acc[type]) {
        acc[type] = [];
      }

      acc[type].push({
        name,
        value: field.value,
      });

      return acc;
    },
    {} as Record<
      FieldType,
      {
        name: string;
        value: string;
      }[]
    >,
  );
  console.log(grouped);
  return grouped;
}
