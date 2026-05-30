import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import { FieldType } from "../../../shared/types/node.interface";


interface ConfigFormBodyProps {
  fields: any[];
  node: any;
  bindingModes: Record<string, "static" | "binding">;
  setBindingModes: React.Dispatch<React.SetStateAction<Record<string, "static" | "binding">>>;
  handleFieldChange: (key: string, value: unknown) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  availableBindings: any[];
  canHaveOutput: boolean;
  outputs: Record<string, { type: FieldType; value: string }>;
  addOutput: (name: string, type: FieldType) => void;
  changeOutput: (key: string, field: "type" | "value", value: string) => void;
  deleteOutput: (key: string) => void;
}

export const ConfigFormBody: React.FC<ConfigFormBodyProps> = ({
  fields,
  node,
  bindingModes,
  setBindingModes,
  handleFieldChange,
  errors,
  touched,
  availableBindings,
  canHaveOutput,
  outputs,
  addOutput,
  changeOutput,
  deleteOutput,
}) => {
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("string");

  const handleAddField = () => {
    const trimmed = newFieldName.trim();
    if (!trimmed) return;
    addOutput(trimmed, newFieldType);
    setNewFieldName("");
    setNewFieldType("string");
  };

  return (
    <div className="p-6 flex flex-col gap-5 max-h-100 overflow-y-auto">
      {fields.map((field: any) => {
        const mode = bindingModes[field.key] || "static";
        const currentValue = node.config[field.key] as any;
        const hasError = mode === "static" && touched[field.key] && errors[field.key];
        
        const compatibleBindings = availableBindings?.[field.type];
        return (
          <div key={field.key} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {field.label}
            </label>
            {field.allowBindings && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setBindingModes((prev) => ({ ...prev, [field.key]: "static" }))
                  }
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    mode === "static"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Static
                </button>
                <button
                  onClick={() =>
                    setBindingModes((prev) => ({ ...prev, [field.key]: "binding" }))
                  }
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    mode === "binding"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Variable
                </button>
              </div>
            )}
            {mode === "static" && (
              <>
                {field.component === "textarea" ? (
                  <textarea
                    value={currentValue?.value || ""}
                    onChange={(e) =>
                      handleFieldChange(field.key, { kind: "static", value: e.target.value })
                    }
                    className={`w-full bg-slate-950 border rounded-2xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none min-h-25 transition-all resize-none ${
                      hasError ? "border-rose-500/80" : "border-slate-800"
                    }`}
                  />
                ) : (
                  <input
                    type="text"
                    value={currentValue?.value || ""}
                    onChange={(e) =>
                      handleFieldChange(field.key, { kind: "static", value: e.target.value })
                    }
                    className={`w-full bg-slate-950 border rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all ${
                      hasError ? "border-rose-500/80" : "border-slate-800"
                    }`}
                  />
                )}
              </>
            )}
            {mode === "binding" && (
              <select
                value={currentValue?.sourceField || ""}
                onChange={(e) => {
                  const selected = compatibleBindings?.find(
                    (b: any) => b.field === e.target.value
                  );
                  if (!selected) return;
                  handleFieldChange(field.key, {
                    kind: "binding",
                    sourceNodeId: selected.nodeId,
                    sourceField: selected.field,
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none"
              >
                <option value="">Select Variable</option>
                {compatibleBindings?.map((binding: any) => (
                  <option key={`${binding.nodeId}-${binding.field}`} value={binding.field}>
                    {binding.name}
                  </option>
                ))}
              </select>
            )}
            {hasError && (
              <span className="text-[11px] text-rose-400 font-medium px-1">
                ⚠️ {errors[field.key]}
              </span>
            )}
          </div>
        );
      })}
      {fields.length === 0 && (
        <p className="text-center text-xs text-slate-500 py-4">No configuration required for this node.</p>
      )}
      {canHaveOutput && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-slate-300 mb-2">Outputs</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(outputs).map(([key, val]: any) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-sm text-slate-100 bg-slate-800 px-2 py-1 rounded flex-1 truncate">
                  {key}
                </span>
                <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                  {val.type}
                </span>
                <button
                  onClick={() => deleteOutput(key)}
                  className="text-rose-500 hover:text-rose-300"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                className="bg-slate-800 text-slate-100 px-2 py-1 rounded flex-1"
                placeholder="Field name"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                className="bg-slate-800 text-slate-100 px-2 py-1 rounded"
              >
                {["string","email","number","boolean"].map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddField}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
