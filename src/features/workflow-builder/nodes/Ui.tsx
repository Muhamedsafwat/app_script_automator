import { Handle, Position, type NodeProps } from "@xyflow/react";
import { nodeRegistry } from "@/shared/registry/node.registry";

interface WorkflowNodeData extends Record<string, unknown> {
  definitionType: string;
  config: Record<string, unknown>;
}

const Ui = ({ data, isConnectable }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const nodeDef = nodeRegistry[nodeData.definitionType as keyof typeof nodeRegistry];
  const label = nodeDef?.ui.metadata.label || "Custom Node";
  const category = nodeDef?.ui.metadata.category || "General";
  const Icon = nodeDef?.ui.metadata.icon;

  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl shadow-sm p-4 min-w-[220px] transition-all hover:shadow-md hover:border-blue-500/20 group">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-slate-300 border-2 border-white group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-200"
      />

      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <Icon size={20} />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
            {category}
          </span>
          <h3 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-slate-900 transition-colors">
            {label}
          </h3>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white group-hover:scale-110 transition-all duration-200"
      />
    </div>
  );
};

export default Ui;
