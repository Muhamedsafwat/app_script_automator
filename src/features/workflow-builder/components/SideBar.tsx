import useWorkflowStore from "../store/useWorkflowStore";
import { nodeRegistry } from "@/shared/registry/node.registry";


export default function SideBar() {
  const addNode = useWorkflowStore((s) => s.addNode);

  const handleAddNode = (definitionType: string) => {
    addNode(definitionType, {
      x: Math.random() * 200 + 100,
      y: Math.random() * 200 + 100,
    });
  };

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 p-4 shadow-sm z-10 flex flex-col fixed top-1/2 -translate-y-1/2">
      {Object.values(nodeRegistry).map((node, index) =>  (<button
        key={index}
        onClick={() => handleAddNode(node.type)}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow transition-colors"
      >
        {node.ui.metadata.label}
      </button>) )}
      <button onClick={() => console.log(useWorkflowStore.getState().nodes)}>log</button>
    </aside>
  );
}
