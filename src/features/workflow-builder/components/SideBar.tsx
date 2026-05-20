import { useState } from "react";
import useWorkflowStore from "../store/useWorkflowStore";
import { nodeRegistry } from "@/shared/registry/node.registry";
import { FiPlus, FiChevronDown, FiChevronRight } from "react-icons/fi";

export default function SideBar() {
  const addNode = useWorkflowStore((s) => s.addNode);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleAddNode = (definitionType: string) => {
    addNode(definitionType, {
      x: Math.random() * 200 + 100,
      y: Math.random() * 200 + 100,
    });
  };

  const getCategoryNodes = (categoryObj: any) => {
    return Object.entries(categoryObj)
      .filter(([key]) => key !== "metadata")
      .map(([_, nodeDef]) => nodeDef as any);
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <div className="fixed left-4 top-10  z-50 flex items-start gap-3">
      {/* Vertical Dock with Plus Button */}
      <aside className="bg-slate-800 border border-slate-700/80 p-3 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all duration-300 ${
            isOpen
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          }`}
          title={isOpen ? "Close library" : "Open library"}
        >
          <FiPlus size={22} className={`transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
        </button>
      </aside>

      {/* Slide-out Side Panel */}
      {isOpen && (
        <div className="w-64 bg-slate-800 border border-slate-700/80 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 text-white">
          <div className="border-b border-slate-700 pb-2">
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Node Library</h3>
            <p className="text-[10px] text-slate-400">Select a component to add</p>
          </div>

          <div className="flex flex-col gap-2 max-h-75 overflow-y-auto pr-1">
            {nodeRegistry.map((categoryObj, index) => {
              const metadata = categoryObj.metadata;
              const categoryName = metadata.category;
              const CategoryIcon = metadata.icon;
              const isExpanded = expandedCategory === categoryName;
              const nodes = getCategoryNodes(categoryObj);

              return (
                <div key={index} className="flex flex-col gap-1">
                  {/* Category Header / Dropdown Trigger */}
                  <button
                    onClick={() => toggleCategory(categoryName)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-700 hover:bg-slate-700/80 rounded-xl transition-all border border-slate-700/30 group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg flex items-center justify-center ${metadata.style || 'bg-slate-600 text-white'}`}>
                        {CategoryIcon && <CategoryIcon size={16} />}
                      </div>
                      <span className="text-xs font-semibold tracking-wide text-slate-200 group-hover:text-white transition-colors">
                        {categoryName}
                      </span>
                    </div>
                    <div className="text-slate-400 group-hover:text-slate-200 transition-colors">
                      {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                    </div>
                  </button>

                  {/* Dropdown Node List */}
                  {isExpanded && (
                    <div className="flex flex-col gap-1 pl-3 py-1 border-l border-slate-700/50 ml-5">
                      {nodes.map((node) => (
                        <button
                          key={node.type}
                          onClick={() => handleAddNode(node.type)}
                          className="w-full text-left py-1.5 px-3 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-700/40 border border-transparent hover:border-slate-700/30 transition-all"
                        >
                          {node.ui.metadata.label}
                        </button>
                      ))}
                      {nodes.length === 0 && (
                        <span className="text-[10px] text-slate-500 pl-3">No nodes in category</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <button 
            onClick={() => console.log(useWorkflowStore.getState().nodes)}
            className="w-full mt-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all text-center"
          >
            Log Nodes Store
          </button>
        </div>
      )}
    </div>
  );
}
