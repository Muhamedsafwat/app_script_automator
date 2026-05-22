import { useState, useEffect } from "react";
import useWorkflowStore from "../store/useWorkflowStore";
import { nodeRegistry } from "@/shared/registry/node.registry";
import { validateForm } from "@/shared/utils/validator";
import { resolveAvailableBindings } from "@/shared/utils/resolve-available-bindings";

export function useConfigForm() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);
  const workflowNodes = useWorkflowStore((s) => s.nodes);

  const node = workflowNodes.find((n) => n.id === selectedNodeId);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [bindingModes, setBindingModes] = useState<Record<string, "static" | "binding">>({});

  // Find node definition
  let foundCategory: any = null;
  let foundNodeDef: any = null;

  if (node) {
    for (const categoryRegistry of Object.values(nodeRegistry)) {
      if (node.definitionType in categoryRegistry) {
        foundCategory = categoryRegistry;
        foundNodeDef = categoryRegistry[node.definitionType as keyof typeof categoryRegistry];
        break;
      }
    }
  }

  // Validate on node change
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
  const availableBindings = resolveAvailableBindings(workflowNodes, node.id);

  const handleFieldChange = (key: string, value: unknown) => {
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

  return {
    metadata,
    fields,
    CategoryIcon,
    availableBindings,
    bindingModes,
    setBindingModes,
    handleFieldChange,
    handleSave,
    errors,
    touched,
    setTouched,
    node,
  };
}
