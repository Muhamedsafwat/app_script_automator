// workflow
export interface WorkflowStore {
  updateNodePosition: any;
  addEdge: any;
  nodes: WorkflowNodeInstance[];
  edges: WorkflowEdge[];
  addNode: (definitionType: string, position: { x: number; y: number }) => void;
}

// node
export interface WorkflowNodeInstance {
  id: string;
  definitionType: string;
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
