import { useState, useEffect } from "react";
import useWorkflowStore from "../store/useWorkflowStore";
import { nodeRegistry } from "@/shared/registry/node.registry";
import { validateForm } from "@/shared/utils/validator";
import { resolveAvailableBindings } from "@/shared/utils/resolve-available-bindings";
import { FieldType, GroupedNodeOutput } from "@/shared/types/node.interface";

export const useConfigForm = () => {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);
  const workflowNodes = useWorkflowStore((s) => s.nodes);

  const node = workflowNodes.find((n) => n.id === selectedNodeId);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [bindingModes, setBindingModes] = useState<
    Record<string, "static" | "binding">
  >({});

  // Find node definition
  let foundCategory: any = null;
  let foundNodeDef: any = null;

  if (node) {
    for (const categoryRegistry of Object.values(nodeRegistry)) {
      if (node.definitionType in categoryRegistry) {
        foundCategory = categoryRegistry;
        foundNodeDef =
          categoryRegistry[
            node.definitionType as keyof typeof categoryRegistry
          ];
        break;
      }
    }
  }

  // Validate on node change
  useEffect(() => {
    setTouched({});
    // Sync local outputs state with the newly selected node's config
    setOutputs((node?.config?.outputs as any) || {});

    // No early return; provide safe defaults for missing node/definition
    if (node && foundNodeDef?.schema) {
      const validation = validateForm(foundNodeDef.schema, node.config);
      setErrors(validation.errors);
    } else {
      setErrors({});
    }
  }, [selectedNodeId, node?.definitionType]);

  // Early return removed to maintain Hook order
  const metadata = foundNodeDef?.ui?.metadata || {};
  const fields = foundNodeDef?.ui?.fields || [];
  const CategoryIcon = foundCategory?.metadata?.icon;

  const availableBindings: GroupedNodeOutput = node
    ? resolveAvailableBindings(node.id)
    : {};
  // ---- Output handling ----------------------------------------------------

  const canHaveOutput: boolean = !!foundNodeDef?.canHaveOutput;
  const [outputs, setOutputs] = useState<Record<string, { type: FieldType }>>(
    // Initialise from existing config if present
    (node?.config?.outputs as any) || {},
  );

  // Whenever outputs change we persist them back to the node config.
  const updateOutputs = (newOutputs: Record<string, { type: FieldType }>) => {
    if (!node) return;
    setOutputs(newOutputs);
    updateNodeConfig(node.id, { outputs: newOutputs });
  };

  // Helper to add a fresh output entry.
  const addOutput = (name: string, type: FieldType) => {
    const newOutputs = {
      ...outputs,
      [name]: { type, value: "" },
    };
    updateOutputs(newOutputs);
  };

  // Helper to delete an output entry.
  const deleteOutput = (key: string) => {
    const { [key]: _, ...rest } = outputs;
    updateOutputs(rest);
  };
  // -----------------------------------------------------------------------

  const handleFieldChange = (key: string, value: unknown) => {
    if (!node) return;
    const updatedConfig = { ...node.config, [key]: value };
    updateNodeConfig(node.id, { [key]: value });

    if (foundNodeDef?.schema) {
      const validation = validateForm(foundNodeDef.schema, updatedConfig);
      setErrors(validation.errors);
    }

    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleSave = () => {
    if (!node) {
      // No node selected; nothing to save
      return;
    }
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
    // State
    errors,
    touched,
    bindingModes,
    setBindingModes,
    // UI data
    metadata,
    fields,
    CategoryIcon,
    availableBindings,
    // Output handling
    canHaveOutput,
    outputs,
    addOutput,
    deleteOutput,
    // Handlers
    handleFieldChange,
    handleSave,
    // Control
    setSelectedNodeId,
    node,
  } as const;
};
