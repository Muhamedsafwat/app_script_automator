import { useState, useEffect } from "react";
import useWorkflowStore from "../store/useWorkflowStore";
import { nodeRegistry } from "@/shared/registry/node.registry";
import { FiX } from "react-icons/fi";
import { validateForm } from "@/shared/utils/validator";

export default function ConfigForm() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);

  const node = useWorkflowStore((s) =>
    s.nodes.find((n) => n.id === selectedNodeId)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Find the category registry and node definition inside the nodeRegistry array
  let foundCategory: any = null;
  let foundNodeDef: any = null;

  if (node) {
    for (const categoryRegistry of nodeRegistry) {
      if (node.definitionType in categoryRegistry) {
        foundCategory = categoryRegistry;
        foundNodeDef = categoryRegistry[node.definitionType as keyof typeof categoryRegistry];
        break;
      }
    }
  }

  // Validate initial config or when node selection changes
  useEffect(() => {
    setTouched({});
    if (node && foundNodeDef?.schema) {
      const validation = validateForm(foundNodeDef.schema, node.config);
      setErrors(validation.errors);
    } else {
      setErrors({});
    }
  }, [selectedNodeId, node?.definitionType]);

  if (!node || !foundNodeDef) return null;

  const metadata = foundNodeDef.ui.metadata;
  const fields = foundNodeDef.ui.fields;
  const CategoryIcon = foundCategory?.metadata.icon;

  const handleFieldChange = (key: string, value: string) => {
    const updatedConfig = { ...node.config, [key]: value };
    updateNodeConfig(node.id, { [key]: value });

    if (foundNodeDef?.schema) {
      const validation = validateForm(foundNodeDef.schema, updatedConfig);
      setErrors(validation.errors);
    }

    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleSave = () => {
    if (foundNodeDef?.schema) {
      const validation = validateForm(foundNodeDef.schema, node.config);
      if (!validation.success) {
        setErrors(validation.errors);
        
        // Touch all fields to reveal errors
        const allTouched: Record<string, boolean> = {};
        fields.forEach((field: any) => {
          allTouched[field.key] = true;
        });
        setTouched(allTouched);
        return;
      }
    }
    setSelectedNodeId(null);
  };

  return (
    <div
      onClick={() => setSelectedNodeId(null)}
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md text-white flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${foundCategory?.metadata.style || 'bg-slate-800 text-white'}`}>
              {CategoryIcon && <CategoryIcon size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                {metadata.label} Settings
              </h3>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                {metadata.category} Node
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
            title="Close Settings"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Modal Body / Dynamic Form */}
        <div className="p-6 flex flex-col gap-5 max-h-100 overflow-y-auto">
          {fields.map((field: any) => {
            const currentValue = String(node.config[field.key] || "");
            const hasError = touched[field.key] && errors[field.key];
            
            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {field.label}
                </label>
                
                {field.component === "textarea" ? (
                  <textarea
                    value={currentValue}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className={`w-full bg-slate-950 border rounded-2xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none min-h-25 transition-all resize-none ${
                      hasError
                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                ) : (
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className={`w-full bg-slate-950 border rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all ${
                      hasError
                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                )}

                {hasError && (
                  <span className="text-[11px] text-rose-400 font-medium px-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    ⚠️ {errors[field.key]}
                  </span>
                )}
              </div>
            );
          })}

          {fields.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-4">
              No configuration required for this node.
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all text-center"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
}
