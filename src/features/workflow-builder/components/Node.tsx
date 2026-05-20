import { Handle, Position, type NodeProps } from "@xyflow/react";
import { nodeRegistry } from "@/shared/registry/node.registry";

interface WorkflowNodeData extends Record<string, unknown> {
  definitionType: string;
  config: Record<string, unknown>;
}

const Ui = ({ data, isConnectable }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;

  // Find the category registry and node definition inside the nodeRegistry array
  let foundCategory: any = null;
  let foundNodeDef: any = null;

  for (const categoryRegistry of nodeRegistry) {
    if (nodeData.definitionType in categoryRegistry) {
      foundCategory = categoryRegistry;
      foundNodeDef = categoryRegistry[nodeData.definitionType as keyof typeof categoryRegistry];
      break;
    }
  }

  const label = foundNodeDef?.ui.metadata.label || "Custom Node";
  const category = foundCategory?.metadata.category || "General";
  const Icon = foundCategory?.metadata.icon;
  const iconStyle = foundCategory?.metadata.style || "bg-slate-50 text-slate-700 hover:bg-blue-50 group-hover:text-blue-600";

  return (
    <div className="bg-slate-600 border border-slate-100 rounded-2xl shadow-sm p-4 min-w-40 transition-all hover:shadow-md group">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2.5! h-2.5! bg-slate-200 border-2 border-white group-hover:bg-blue-500 group-hover:scale-125 transition-all duration-200"
      />

      <div className="flex items-center gap-2">
        {Icon && (
          <div className={`p-2 rounded-xl flex items-center justify-center transition-colors ${iconStyle}`}>
            <Icon size={20} />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
            {category}
          </span>
          <h3 className="text-slate-200 text-sm leading-tight ">
            {label}
          </h3>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2.5! h-2.5! bg-blue-500 border-2 border-white group-hover:scale-110 transition-all duration-200"
      />
    </div>
  );
};

export default Ui;
