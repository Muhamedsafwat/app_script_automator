import useWorkflowStore from "../store/useWorkflowStore";

let id = 0;
const getId = () => `node_${id++}`;

export default function SideBar() {
  const addNode = useWorkflowStore((s) => s.addNode);

  const handleAddNode = () => {
    addNode({
      id: getId(),
      type: "custom",
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label: `New Node` },
    });
  };

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 p-4 shadow-sm z-10 flex flex-col fixed top-1/2 -translate-y-1/2">
      <button
        onClick={handleAddNode}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow transition-colors"
      >
        Add Node
      </button>
    </aside>
  );
}
