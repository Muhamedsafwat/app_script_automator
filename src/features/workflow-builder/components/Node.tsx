import { Handle, Position, type NodeProps } from "@xyflow/react";
import { nodeRegistry, nodeIconStyleRegistry } from "@/shared/registry/node.registry";


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

  const categoryKey = category.toUpperCase() as keyof typeof nodeIconStyleRegistry;
  const iconStyle = nodeIconStyleRegistry[categoryKey] || "bg-slate-50 text-slate-700 hover:bg-blue-50 group-hover:text-blue-600";

  return (
    <div className="bg-slate-600 border-2 border-slate-100 rounded-2xl shadow-sm p-4 min-w-55 transition-all hover:shadow-md group">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-4 h-4 bg-slate-200 border-2 border-white group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-200"
      />

      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${iconStyle}`}>
            <Icon size={20} />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-300">
            {category}
          </span>
          <h3 className="font-bold text-slate-200 text-sm leading-tight ">
            {label}
          </h3>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-4 h-4 bg-blue-500 border-2 border-white group-hover:scale-110 transition-all duration-200"
      />
    </div>
  );
};

export default Ui;
