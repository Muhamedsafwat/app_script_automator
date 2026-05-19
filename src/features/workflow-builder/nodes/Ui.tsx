import { Handle, Position, type NodeProps } from "@xyflow/react";

const Ui = ({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl shadow-sm p-4 min-w-[200px] transition-shadow hover:shadow-md">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-slate-400 border-2 border-white"
      />

      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-slate-800 text-sm">
          {String(data?.label || "Custom Node")}
        </h3>
        <p className="text-xs text-slate-500">Basic node component</p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
};

export default Ui;
