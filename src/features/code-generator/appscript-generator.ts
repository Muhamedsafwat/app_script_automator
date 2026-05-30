import { nodeRegistry } from "@/shared/registry/node.registry";
import { compileNodeCofig } from "./compiler/compile-node-config";
import { WorkflowDSL } from "../workflow-transformer/types/WorkflowDSL.inteface";

export function generateAppScript(dsl: WorkflowDSL) {
  let code = "";

  for (const step of dsl.steps) {
    const nodeDefinition = nodeRegistry.gmailRegistry[step.type];
    if (!nodeDefinition || !("generator" in nodeDefinition)) continue;
    const compiledConfig = compileNodeCofig(step.config);
    code += nodeDefinition.generator(compiledConfig as any) + "\n";
  }

  return code;
}
