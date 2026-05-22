import { WorkflowNodeDefinition } from "@/shared/types/node.interface";
import { FormSubmitSchema } from "./schema";
import { formSubmitUI } from "./ui_config";
import { generateFormSubmit } from "./generator";

export const formSubmitNode: WorkflowNodeDefinition<typeof FormSubmitSchema> = {
  type: "form-submit",
  kind: "trigger",
  schema: FormSubmitSchema,
  ui: formSubmitUI,
  generator: generateFormSubmit,
  canHaveOutput: true,
};
