import { WorkflowNodeDefinition } from "@/shared/types/node.interface";
import { SendEmailSchema } from "./schema";
import { sendEmailUI } from "./ui_config";
import { generateSendEmail } from "./generator";

// the actual node
export const sendEmailNode: WorkflowNodeDefinition<typeof SendEmailSchema> = {
  type: "send-email",
  kind: "step",
  schema: SendEmailSchema,
  ui: sendEmailUI,
  generator: generateSendEmail,
  canHaveOutput: false,
};
