import { useState, useEffect } from "react";
import useWorkflowStore from "../store/useWorkflowStore";
import { nodeRegistry } from "@/shared/registry/node.registry";
import { validateForm } from "@/shared/utils/validator";
import { resolveAvailableBindings } from "@/shared/utils/resolve-available-bindings";

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
  const availableBindings = node ? resolveAvailableBindings(workflowNodes, node.id) : [];

  // ---- Output handling ----------------------------------------------------
  // Node definitions can optionally allow custom outputs via the
  // `canHaveOutput` flag. When true we expose a UI for managing a
  // collection of outputs where each output is identified by a name and
  // stores a type and a value.
  const canHaveOutput: boolean = !!foundNodeDef?.canHaveOutput;
  const [outputs, setOutputs] = useState<
    Record<string, { type: string; value: string }>
  >(
    // Initialise from existing config if present
    (node?.config?.outputs as any) || {},
  );

  // Whenever outputs change we persist them back to the node config.
  const updateOutputs = (
    newOutputs: Record<string, { type: string; value: string }>,
  ) => {
    setOutputs(newOutputs);
    updateNodeConfig(node.id, { outputs: newOutputs });
  };

  // Helper to add a fresh output entry.
  const addOutput = () => {
    const uniqueKey = `output_${Date.now()}`;
    const newOutputs = {
      ...outputs,
      [uniqueKey]: { type: "string", value: "" },
    };
    updateOutputs(newOutputs);
  };

  // Helper to modify an existing output field.
  const changeOutput = (
    key: string,
    field: "type" | "value",
    value: string,
  ) => {
    const newOutputs = {
      ...outputs,
      [key]: { ...outputs[key], [field]: value },
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

  // Helper to rename an output entry.
  const renameOutput = (oldKey: string, newKey: string) => {
    if (!outputs[oldKey]) return;
    const newOutputs = { ...outputs };
    newOutputs[newKey] = newOutputs[oldKey];
    delete newOutputs[oldKey];
    updateOutputs(newOutputs);
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
    changeOutput,
    deleteOutput,
    renameOutput,
    // Handlers
    handleFieldChange,
    handleSave,
    // Control
    setSelectedNodeId,
    node,
  } as const;
};
