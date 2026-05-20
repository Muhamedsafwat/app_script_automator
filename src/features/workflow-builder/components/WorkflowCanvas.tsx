import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Connection,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import useWorkflowStore from "@/features/workflow-builder/store/useWorkflowStore";

import Ui from "@/features/workflow-builder/components/Node";

import {
  mapWorkflowNodesToReactFlow,
} from "@/features/workflow-transformer/workflow-to-reactflow";

import {
  mapWorkflowEdgesToReactFlow,
} from "@/features/workflow-transformer/workflow-edges-to-reactflow";

export default function WorkflowCanvas() {
  const workflowNodes =
    useWorkflowStore((s) => s.nodes);

  const workflowEdges =
    useWorkflowStore((s) => s.edges);

  const updateNodePosition =
    useWorkflowStore(
      (s) => s.updateNodePosition
    );

  const addWorkflowEdge =
    useWorkflowStore((s) => s.addEdge);

  const reactFlowNodes =
    mapWorkflowNodesToReactFlow(
      workflowNodes
    );

  const reactFlowEdges =
    mapWorkflowEdgesToReactFlow(
      workflowEdges
    );

  const nodeTypes = {
    custom: Ui,
  };

  const handleConnect = (
    connection: Connection
  ) => {
    if (
      !connection.source ||
      !connection.target
    ) {
      return;
    }

    addWorkflowEdge({
      id: crypto.randomUUID(),

      source: connection.source,

      target: connection.target,
    });
  };

  const handleNodeDrag = (
    _: unknown,
    node: { id: any; position: any; }
  ) => {
    updateNodePosition(
      node.id,
      node.position
    );
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        fitView
        snapToGrid
        nodeTypes={nodeTypes}
        defaultViewport={{
          x: 0,
          y: 0,
          zoom: 0.6,
        }}
        onConnect={handleConnect}
        onNodeDrag={handleNodeDrag}
      
      >
        <Controls />
        <Background
          variant={
            BackgroundVariant.Dots
          }
          gap={12}
          size={0.5}
        />
      </ReactFlow>
    </div>
  );
}