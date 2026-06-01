import { nodeRegistry } from "@/shared/registry/node.registry";
import { compileNodeCofig } from "./compiler/compile-node-config";
import { WorkflowDSL } from "../workflow-transformer/types/WorkflowDSL.inteface";

export function generateAppScript(dsl: WorkflowDSL) {
  if (!dsl.trigger) {
    throw new Error("No trigger node found");
  }
  if (!dsl.steps) {
    throw new Error("No steps found");
  }

  let code = "";

  const trigger = nodeRegistry.formsRegistry[dsl.trigger.type];
  if (!trigger || !("generator" in trigger)) {
    throw new Error(`Trigger node ${dsl.trigger.type} not found`);
  }
  const compiledTriggerConfig = compileNodeCofig(dsl.trigger.config);

  code += trigger.generator(compiledTriggerConfig as any) + "\n";

  for (const step of dsl.steps) {
    const nodeDefinition = nodeRegistry.gmailRegistry[step.type];
    if (!nodeDefinition || !("generator" in nodeDefinition)) continue;
    const compiledConfig = compileNodeCofig(step.config);
    code += nodeDefinition.generator(compiledConfig as any) + "\n";
  }

  code += "}";
  return code;
}
