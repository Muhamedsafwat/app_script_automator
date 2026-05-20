// workflow
export interface WorkflowStore {
  updateNodePosition: any;
  addEdge: any;
  nodes: WorkflowNodeInstance[];
  edges: WorkflowEdge[];
  addNode: (
    definitionType: string,
    kind: "trigger" | "step",
    position: { x: number; y: number }
  ) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (nodeId: string | null) => void;
}

// node
export interface WorkflowNodeInstance {
  id: string;
  definitionType: string;
  kind: string;
  position: {
    x: number;
    y: number;
  };

  config: Record<string, unknown>;
}

// edge
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}
