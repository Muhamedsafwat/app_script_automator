import { create } from "zustand";

import type {
  WorkflowEdge,
  WorkflowNodeInstance,
  WorkflowStore,
} from "../types";

import type { Position } from "@/shared/types/position.type";

const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],

  addNode: (
    definitionType: string,
    kind: "step" | "trigger",
    position: Position,
  ) => {
    set({
      nodes: [
        ...get().nodes,
        {
          id: crypto.randomUUID(),
          definitionType,
          kind,
          position,
          config: {},
        },
      ],
    });
  },

  updateNodePosition: (nodeId: string, position: Position) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, position } : node,
      ),
    });
  },

  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              config: {
                ...node.config,
                ...config,
              },
            }
          : node,
      ),
    });
  },

  addEdge: (edge: WorkflowEdge) => {
    set({
      edges: [...get().edges, edge],
    });
  },

  setNodes: (nodes: WorkflowNodeInstance[]) => set({ nodes }),

  setEdges: (edges: WorkflowEdge[]) => set({ edges }),

  selectedNodeId: null,
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
}));

export default useWorkflowStore;
