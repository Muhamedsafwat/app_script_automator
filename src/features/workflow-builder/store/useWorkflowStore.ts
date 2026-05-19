import { create } from "zustand";
import {
  type Edge,
  type Node,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import type { WorkflowState } from "../types";

const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (params) => {
    set({ edges: addEdge(params, get().edges) });
  },

  addNode: (node: Node) => {
    set({ nodes: [...get().nodes, node] });
  },

  setNodes: (nodes: Node[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
}));

export default useWorkflowStore;
